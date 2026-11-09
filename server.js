const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const THEMEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

let meals = [];

async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Meal-Dashboard-Student-Project'
    }
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`API Error ${response.status}`);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('TheMealDB ไม่ได้ส่งข้อมูล JSON กลับมา');
  }
}

async function loadMeals() {
  try {
    const data = await fetchJSON(`${THEMEALDB_BASE}/filter.php?a=Thai`);
    if (data && data.meals) {
      meals = data.meals.slice(0, 50).map(meal => ({
        id: Number(meal.idMeal),
        name: meal.strMeal,
        category: 'Thai Food',
        area: 'Thai',
        image: meal.strMealThumb
      }));
    }
  } catch (error) {
    console.error('Error loading initial meals:', error.message);
  }
}

function normalizeMeal(meal) {
  return {
    id: Number(meal.idMeal),
    name: meal.strMeal,
    category: meal.strCategory || '',
    area: meal.strArea || '',
    instructions: meal.strInstructions || '',
    image: meal.strMealThumb || ''
  };
}

app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุคำค้นหา' });
    }
    const data = await fetchJSON(`${THEMEALDB_BASE}/search.php?s=${encodeURIComponent(q)}`);
    
    if (!data.meals) {
      return res.json({ success: true, count: 0, keyword: q, data: [] });
    }

    const result = data.meals.map(normalizeMeal);
    res.json({ success: true, count: result.length, keyword: q, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการค้นหา' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const data = await fetchJSON(`${THEMEALDB_BASE}/list.php?c=list`);
    const categories = (data.meals || []).map(item => item.strCategory);
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'ไม่สามารถโหลด Category ได้' });
  }
});

app.get('/api/areas', async (req, res) => {
  try {
    const data = await fetchJSON(`${THEMEALDB_BASE}/list.php?a=list`);
    const areas = (data.meals || []).map(item => item.strArea);
    res.json({ success: true, count: areas.length, data: areas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'ไม่สามารถโหลด Area ได้' });
  }
});

loadMeals().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});

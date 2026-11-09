<<<<<<< HEAD
// =====================================================================
// 801201 Week 8
// Sort (W5) + Queue (W6) + Stack (W8)
// Search + API + TheMealDB
// =====================================================================

import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
=======
import express from 'express';
>>>>>>> 41434fc (แก้ไขการเชื่อมหน้า)

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const THEMEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

// =====================================================================
// MIDDLEWARE
// =====================================================================

app.use(express.json());
<<<<<<< HEAD
app.use(cors());

// หน้าเว็บอยู่ใน public
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================================
// THEMEALDB API
// =====================================================================

const THEMEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

// =====================================================================
// ตัวแปรเก็บข้อมูล
// =====================================================================

let meals = [];

// =====================================================================
// ฟังก์ชันเรียก API แบบปลอดภัย
// =====================================================================

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
    console.error('API ส่งข้อมูลที่ไม่ใช่ JSON:');
    console.error(text.substring(0, 300));
    throw new Error('TheMealDB ไม่ได้ส่งข้อมูล JSON กลับมา');
  }
}

// =====================================================================
// LOAD MEALS
// โหลดเมนูไทยสำหรับหน้าแรก
// =====================================================================

async function loadMeals() {
  try {
    console.log('');
    console.log('====================================');
    console.log('กำลังโหลดเมนูอาหารไทยจาก TheMealDB');
    console.log('====================================');

    const data = await fetchJSON(`${THEMEALDB_BASE}/filter.php?a=Thai`);

    if (!data || !data.meals) {
      throw new Error('ไม่พบข้อมูลเมนูอาหารไทยจาก API');
    }

    const thaiMeals = data.meals.slice(0, 50);

    console.log(`พบข้อมูลทั้งหมด ${data.meals.length} เมนู`);
    console.log(`นำมาใช้ในโปรเจกต์ ${thaiMeals.length} เมนู`);

    meals = thaiMeals.map(meal => ({
      id: Number(meal.idMeal),
      name: meal.strMeal,
      category: 'Thai Food',
      area: 'Thai',
      instructions: '',
      image: meal.strMealThumb
    }));

    console.log(`โหลดข้อมูลสำเร็จ ${meals.length} เมนู`);
    console.log('====================================');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลอาหาร');
    console.error(error.message);
    console.error('');
    meals = [];
  }
}
=======
>>>>>>> 41434fc (แก้ไขการเชื่อมหน้า)

// =====================================================================
// SORT
// =====================================================================

function selectionSort(arr) {
  const a = [...arr];

  for (let i = 0; i < a.length - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < a.length; j++) {
      if (
        a[j].name.toLowerCase() <
        a[minIndex].name.toLowerCase()
      ) {
        minIndex = j;
      }
    }

    [a[i], a[minIndex]] = [a[minIndex], a[i]];
  }

  return a;
}

function insertionSort(arr) {
  const a = [...arr];

  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;

    while (
      j >= 0 &&
      a[j].name.toLowerCase() > key.name.toLowerCase()
    ) {
      a[j + 1] = a[j];
      j--;
    }

    a[j + 1] = key;
  }

  return a;
}

function bubbleSort(arr) {
  const a = [...arr];

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      if (
        a[j].name.toLowerCase() >
        a[j + 1].name.toLowerCase()
      ) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
      }
    }
  }

  return a;
}

// =====================================================================
// Helper: แปลงข้อมูล TheMealDB
// =====================================================================

function normalizeMeal(meal) {
  return {
    id: Number(meal.idMeal),
    idMeal: meal.idMeal,
    name: meal.strMeal || '',
    strMeal: meal.strMeal || '',
    category: meal.strCategory || '',
    strCategory: meal.strCategory || '',
    area: meal.strArea || '',
    strArea: meal.strArea || '',
    image: meal.strMealThumb || '',
    strMealThumb: meal.strMealThumb || '',
    ...Object.fromEntries(
      Array.from({ length: 20 }, (_, index) => {
        const number = index + 1;
        return [
          [`strIngredient${number}`, meal[`strIngredient${number}`] || ''],
          [`strMeasure${number}`, meal[`strMeasure${number}`] || ''],
        ];
      }).flat(),
    ),
    strInstructions: meal.strInstructions || '',
    strYoutube: meal.strYoutube || '',
  };
}

<<<<<<< HEAD
// =====================================================================
// API /meals
// =====================================================================

app.get('/meals', (req, res) => {
  try {
    const algorithm = req.query.sort || 'selection';
    const start = performance.now();
    let sortedMeals;

    if (algorithm === 'insertion') {
      sortedMeals = insertionSort(meals);
    } else if (algorithm === 'bubble') {
      sortedMeals = bubbleSort(meals);
    } else {
      sortedMeals = selectionSort(meals);
    }

    const end = performance.now();
    const time = (end - start).toFixed(3);

    res.json({
      algorithm,
      count: sortedMeals.length,
      ms: time,
      data: sortedMeals
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// =====================================================================
// SEARCH API
// =====================================================================

app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุคำค้นหา'
      });
    }

    const url = `${THEMEALDB_BASE}/search.php?s=${encodeURIComponent(q)}`;
    const data = await fetchJSON(url);

    if (!data.meals) {
      return res.json({
        success: true,
        count: 0,
        keyword: q,
        message: `ไม่พบเมนูอาหารที่ค้นหา "${q}"`,
        data: []
      });
    }

    const result = data.meals.map(normalizeMeal);

    res.json({
      success: true,
      count: result.length,
      keyword: q,
      data: result
    });

  } catch (error) {
    console.error('Search Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการค้นหาอาหาร'
    });
  }
});

// =====================================================================
// CATEGORY API
// =====================================================================

app.get('/api/categories', async (req, res) => {
  try {
    const data = await fetchJSON(`${THEMEALDB_BASE}/list.php?c=list`);
    const categories = (data.meals || []).map(item => item.strCategory);

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });

  } catch (error) {
    console.error('Category Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถโหลด Category ได้'
    });
  }
});

// =====================================================================
// AREA API
// =====================================================================

app.get('/api/areas', async (req, res) => {
  try {
    const data = await fetchJSON(`${THEMEALDB_BASE}/list.php?a=list`);
    const areas = (data.meals || []).map(item => item.strArea);

    res.json({
      success: true,
      count: areas.length,
      data: areas
    });

  } catch (error) {
    console.error('Area Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถโหลด Area ได้'
    });
  }
});

// =====================================================================
// SEARCH + FILTER API
// =====================================================================

app.get('/api/meals', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();
    const area = String(req.query.area || '').trim();

    let result = [];

    if (search) {
      const url = `${THEMEALDB_BASE}/search.php?s=${encodeURIComponent(search)}`;
      const data = await fetchJSON(url);
      result = data.meals || [];
    } else if (category) {
      const url = `${THEMEALDB_BASE}/filter.php?c=${encodeURIComponent(category)}`;
      const data = await fetchJSON(url);
      result = (data.meals || []).map(meal => ({
        ...meal,
        strCategory: category,
        strArea: ''
      }));
    } else if (area) {
      const url = `${THEMEALDB_BASE}/filter.php?a=${encodeURIComponent(area)}`;
      const data = await fetchJSON(url);
      result = (data.meals || []).map(meal => ({
        ...meal,
        strCategory: '',
        strArea: area
      }));
    } else {
      const url = `${THEMEALDB_BASE}/filter.php?a=Thai`;
      const data = await fetchJSON(url);
      result = (data.meals || []).slice(0, 50).map(meal => ({
        ...meal,
        strCategory: 'Thai Food',
        strArea: 'Thai'
      }));
    }

    if (category && search) {
      result = result.filter(meal => meal.strCategory === category);
    }

    if (area && search) {
      result = result.filter(meal => meal.strArea === area);
    }

    const normalized = result.map(normalizeMeal);

    if (normalized.length === 0) {
      return res.json({
        success: true,
        count: 0,
        message: 'ไม่พบเมนูอาหารตามเงื่อนไขที่ค้นหา',
        data: []
      });
    }

    res.json({
      success: true,
      count: normalized.length,
      data: normalized
    });

  } catch (error) {
    console.error('Meals API Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลอาหาร'
    });
  }
});

// =====================================================================
// MEAL DETAIL API
// =====================================================================

app.get('/api/meal/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Meal ID ไม่ถูกต้อง' });
    }
    const data = await fetchJSON(`${THEMEALDB_BASE}/lookup.php?i=${encodeURIComponent(id)}`);
    if (!data.meals || !data.meals[0]) {
      return res.status(404).json({ error: 'ไม่พบรายละเอียดเมนูนี้' });
    }
    const meal = normalizeMeal(data.meals[0]);
    meal.ingredients = Array.from({ length: 20 }, (_, i) => {
      const ingredient = data.meals[0][`strIngredient${i + 1}`];
      const measure = data.meals[0][`strMeasure${i + 1}`];
      return ingredient && ingredient.trim()
        ? { ingredient: ingredient.trim(), measure: (measure || '').trim() }
        : null;
    }).filter(Boolean);
    res.json({ data: meal });
  } catch (error) {
    res.status(500).json({ error: 'โหลดรายละเอียดเมนูไม่สำเร็จ' });
  }
});

// =====================================================================
// QUEUE & STACK
// =====================================================================

class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(item) { this.items.push(item); }
  dequeue() { return this.items.shift(); }
  peek() { return this.items[0]; }
  size() { return this.items.length; }
}

class Stack {
  constructor() {
    this.items = [];
  }
  push(item) { this.items.push(item); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  display() { return [...this.items].reverse(); }
}

const watchlist = new Queue();
const history = new Stack();

app.get('/watchlist', (req, res) => {
  res.json({
    items: watchlist.items,
    size: watchlist.size(),
    next: watchlist.peek() || null
  });
=======
async function fetchMealDB(path, params = {}) {
  const searchParams = new URLSearchParams(params);
  const url = `${THEMEALDB_BASE}/${path}?${searchParams}`;
  const cached = cache.get(url);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`TheMealDB returned HTTP ${response.status}`);
  }

  const data = await response.json();
  cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

function getQueryString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeIngredientName(ingredient) {
  return ingredient.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function getIngredientSelections(value) {
  if (!Array.isArray(value) || value.length > 20) {
    return null;
  }

  const selections = value.map((ingredient) =>
    typeof ingredient === 'string' ? ingredient.trim() : '',
  );
  if (selections.some((ingredient) => !ingredient || ingredient.length > 100)) {
    return null;
  }

  return [...new Set(selections)];
}

async function fetchMealsByFirstLetter() {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const meals = [];

  for (let index = 0; index < letters.length; index += 5) {
    const batch = letters.slice(index, index + 5);
    const results = await Promise.all(
      batch.map((letter) => fetchMealDB('search.php', { f: letter })),
    );
    meals.push(...results.flatMap((result) => result.meals || []));
  }

  return [...new Map(meals.map((meal) => [meal.idMeal, meal])).values()];
}

async function fetchMealDetails(mealIds) {
  const meals = [];

  for (let index = 0; index < mealIds.length; index += 8) {
    const batch = mealIds.slice(index, index + 8);
    const results = await Promise.all(
      batch.map((id) => fetchMealDB('lookup.php', { i: id })),
    );
    meals.push(...results.flatMap((result) => result.meals || []));
  }

  return meals;
}

function hasSelectedIngredients(meal, included, excluded) {
  const mealIngredients = new Set(
    Array.from({ length: 20 }, (_, index) => meal[`strIngredient${index + 1}`])
      .filter((ingredient) => typeof ingredient === 'string' && ingredient.trim())
      .map(normalizeIngredientName),
  );

  return (
    included.every((ingredient) =>
      mealIngredients.has(normalizeIngredientName(ingredient)),
    ) &&
    excluded.every(
      (ingredient) => !mealIngredients.has(normalizeIngredientName(ingredient)),
    )
  );
}

function sendApiError(res, error, message) {
  console.error(message, error);
  res.status(502).json({
    success: false,
    message: 'ไม่สามารถเชื่อมต่อ TheMealDB ได้ในขณะนี้',
  });
}

app.get('/api/search', async (req, res) => {
  const keyword = getQueryString(req.query.q);
  if (!keyword || keyword.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุคำค้นหาไม่เกิน 100 ตัวอักษร',
    });
  }

  try {
    const result = await fetchMealDB('search.php', { s: keyword });
    const meals = (result.meals || []).map(normalizeMeal);
    res.json({
      success: true,
      count: meals.length,
      keyword,
      data: meals,
    });
  } catch (error) {
    sendApiError(res, error, 'Meal search failed:');
  }
});

app.get('/api/meal/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Meal ID ต้องเป็นตัวเลข',
    });
  }

  try {
    const result = await fetchMealDB('lookup.php', { i: req.params.id });
    const meal = result.meals?.[0];
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลเมนูอาหาร',
      });
    }
    res.json({ success: true, data: normalizeMeal(meal) });
  } catch (error) {
    sendApiError(res, error, 'Meal lookup failed:');
  }
});

app.get('/api/ingredients', async (req, res) => {
  const ingredient = getQueryString(req.query.i);
  if (!ingredient || ingredient.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุวัตถุดิบไม่เกิน 100 ตัวอักษร',
    });
  }

  try {
    const result = await fetchMealDB('filter.php', { i: ingredient });
    const meals = (result.meals || []).map(normalizeMeal);
    res.json({ success: true, count: meals.length, data: meals });
  } catch (error) {
    sendApiError(res, error, 'Ingredient search failed:');
  }
});

app.get('/api/ingredient-list', async (_req, res) => {
  try {
    const result = await fetchMealDB('list.php', { i: 'list' });
    const ingredients = [...new Set(
      (result.meals || [])
        .map((item) => item.strIngredient?.trim())
        .filter(Boolean),
    )].sort((first, second) => first.localeCompare(second));
    res.json({ success: true, count: ingredients.length, data: ingredients });
  } catch (error) {
    sendApiError(res, error, 'Ingredient list failed:');
  }
});

app.post('/api/ingredient-search', async (req, res) => {
  const included = getIngredientSelections(req.body?.included);
  const excluded = getIngredientSelections(req.body?.excluded);

  if (!included || !excluded) {
    return res.status(400).json({
      success: false,
      message: 'รายการวัตถุดิบไม่ถูกต้อง (สูงสุด 20 รายการต่อส่วน)',
    });
  }

  if (included.length === 0 && excluded.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาเลือกวัตถุดิบอย่างน้อย 1 รายการ',
    });
  }

  const includedNames = new Set(included.map(normalizeIngredientName));
  if (excluded.some((ingredient) => includedNames.has(normalizeIngredientName(ingredient)))) {
    return res.status(400).json({
      success: false,
      message: 'วัตถุดิบเดียวกันไม่สามารถอยู่ในรายการที่มีและไม่ต้องการได้',
    });
  }

  try {
    let candidateIds;
    if (included.length > 0) {
      const results = await Promise.all(
        included.map((ingredient) =>
          fetchMealDB('filter.php', {
            i: ingredient.trim().replace(/\s+/g, '_'),
          }),
        ),
      );
      const idsByIngredient = results.map(
        (result) => new Set((result.meals || []).map((meal) => meal.idMeal)),
      );
      candidateIds = [...idsByIngredient[0]].filter((id) =>
        idsByIngredient.every((ids) => ids.has(id)),
      );

      if (candidateIds.length === 0) {
        return res.json({ success: true, count: 0, data: [] });
      }
    }

    const candidates =
      !candidateIds || candidateIds.length > 100
        ? await fetchMealsByFirstLetter()
        : await fetchMealDetails(candidateIds);
    const candidateIdSet = candidateIds ? new Set(candidateIds) : null;
    const meals = candidates
      .filter((meal) => !candidateIdSet || candidateIdSet.has(meal.idMeal))
      .filter((meal) => hasSelectedIngredients(meal, included, excluded))
      .map(normalizeMeal);

    res.json({ success: true, count: meals.length, data: meals });
  } catch (error) {
    sendApiError(res, error, 'Ingredient search failed:');
  }
});

app.get('/api/categories', async (_req, res) => {
  try {
    const result = await fetchMealDB('list.php', { c: 'list' });
    const categories = (result.meals || []).map((item) => item.strCategory);
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    sendApiError(res, error, 'Category list failed:');
  }
});

app.get('/api/areas', async (_req, res) => {
  try {
    const result = await fetchMealDB('list.php', { a: 'list' });
    const areas = (result.meals || []).map((item) => item.strArea);
    res.json({ success: true, count: areas.length, data: areas });
  } catch (error) {
    sendApiError(res, error, 'Area list failed:');
  }
});

app.listen(PORT, () => {
  console.log(`FoodFinder API listening at http://localhost:${PORT}`);
>>>>>>> 41434fc (แก้ไขการเชื่อมหน้า)
});

app.post('/watchlist', async (req, res) => {
  try {
    const id = Number(req.body.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Meal ID ไม่ถูกต้อง' });
    }

    if (watchlist.items.some(item => Number(item.id) === id)) {
      return res.status(409).json({ error: 'เมนูนี้อยู่ใน Queue แล้ว' });
    }

    let meal = meals.find(item => Number(item.id) === id);
    if (!meal) {
      const data = await fetchJSON(`${THEMEALDB_BASE}/lookup.php?i=${id}`);
      if (!data.meals || !data.meals[0]) {
        return res.status(404).json({ error: 'ไม่พบเมนูอาหารนี้' });
      }
      meal = normalizeMeal(data.meals[0]);
    }

    watchlist.enqueue(meal);
    history.push({ action: 'ADD', meal, time: new Date().toLocaleTimeString('th-TH') });
    res.status(201).json({ message: `เพิ่ม ${meal.name} เข้าคิวแล้ว`, size: watchlist.size() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/watchlist/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = watchlist.items.findIndex(item => Number(item.id) === id);
  if (index === -1) {
    return res.status(404).json({ error: 'ไม่พบเมนูนี้ใน Queue' });
  }
  const [meal] = watchlist.items.splice(index, 1);
  history.push({ action: 'REMOVE', meal, time: new Date().toLocaleTimeString('th-TH') });
  res.json({ message: `นำ ${meal.name} ออกจากคิวแล้ว`, size: watchlist.size() });
});

app.delete('/watchlist/process', (req, res) => {
  try {
    if (watchlist.size() === 0) {
      return res.status(400).json({ error: 'คิวว่าง ไม่มีเมนูให้เลือก' });
    }
    const meal = watchlist.dequeue();
    history.push({ action: 'COOK', meal, time: new Date().toLocaleTimeString('th-TH') });
    res.json({ message: `เลือก ${meal.name} เรียบร้อย`, size: watchlist.size() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/history', (req, res) => {
  res.json({ history: history.display(), size: history.items.length });
});

app.post('/undo/:position', (req, res) => {
  try {
    const position = Number(req.params.position);
    if (!Number.isInteger(position) || position < 0 || position >= history.items.length) {
      return res.status(404).json({ error: 'ไม่พบรายการประวัติที่เลือก' });
    }
    const stackIndex = history.items.length - 1 - position;
    const selected = history.items.splice(stackIndex, 1)[0];
    applyUndo(selected);
    res.json({ message: `ย้อน ${selected.action} ของ ${selected.meal.name} แล้ว`, size: watchlist.size() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function applyUndo(entry) {
  if (entry.action === 'ADD') {
    const index = watchlist.items.findIndex(item => Number(item.id) === Number(entry.meal.id));
    if (index !== -1) watchlist.items.splice(index, 1);
  } else if (entry.action === 'COOK') {
    if (!watchlist.items.some(item => Number(item.id) === Number(entry.meal.id))) watchlist.items.unshift(entry.meal);
  } else if (entry.action === 'REMOVE') {
    if (!watchlist.items.some(item => Number(item.id) === Number(entry.meal.id))) watchlist.enqueue(entry.meal);
  }
}

app.post('/undo', (req, res) => {
  try {
    if (history.isEmpty()) {
      return res.status(400).json({ error: 'ไม่มีอะไรให้ย้อนกลับ' });
    }
    const last = history.pop();
    applyUndo(last);
    res.json({ message: `ย้อน ${last.action} ของ ${last.meal.name} แล้ว`, size: watchlist.size() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================================
// START SERVER
// =====================================================================

async function startServer() {
  await loadMeals();
  app.listen(PORT, () => {
    console.log('');
    console.log('====================================');
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`จำนวนเมนูที่โหลดได้: ${meals.length}`);
    console.log('====================================');
    console.log('');
  });
}

startServer();

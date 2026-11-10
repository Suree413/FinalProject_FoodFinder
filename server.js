import express from 'express';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const THEMEALDB_API_KEY = encodeURIComponent(
  process.env.THEMEALDB_API_KEY?.trim() || '1',
);
const THEMEALDB_BASE = `https://www.themealdb.com/api/json/v1/${THEMEALDB_API_KEY}`;
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

async function fetchMealDB(endpoint, params = {}, { cacheResponse = true } = {}) {
  const searchParams = new URLSearchParams(params);
  const url = `${THEMEALDB_BASE}/${endpoint}?${searchParams}`;
  const cached = cacheResponse ? cache.get(url) : null;
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
  if (cacheResponse) {
    cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  }
  return data;
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

function sendApiError(res, error, context) {
  console.error(`${context}:`, error);
  res.status(502).json({
    success: false,
    message: 'ไม่สามารถเชื่อมต่อ TheMealDB ได้ในขณะนี้',
  });
}

function selectionSort(items) {
  const sorted = [...items];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    let minIndex = i;
    for (let j = i + 1; j < sorted.length; j += 1) {
      if (sorted[j].name.toLowerCase() < sorted[minIndex].name.toLowerCase()) {
        minIndex = j;
      }
    }
    [sorted[i], sorted[minIndex]] = [sorted[minIndex], sorted[i]];
  }
  return sorted;
}

function insertionSort(items) {
  const sorted = [...items];
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    let j = i - 1;
    while (j >= 0 && sorted[j].name.toLowerCase() > current.name.toLowerCase()) {
      sorted[j + 1] = sorted[j];
      j -= 1;
    }
    sorted[j + 1] = current;
  }
  return sorted;
}

function bubbleSort(items) {
  const sorted = [...items];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    for (let j = 0; j < sorted.length - 1 - i; j += 1) {
      if (sorted[j].name.toLowerCase() > sorted[j + 1].name.toLowerCase()) {
        [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
      }
    }
  }
  return sorted;
}

let meals = [];

async function loadMeals() {
  try {
    const result = await fetchMealDB('filter.php', { a: 'Thai' });
    meals = (result.meals || []).slice(0, 50).map((meal) =>
      normalizeMeal({
        ...meal,
        strCategory: 'Thai Food',
        strArea: 'Thai',
      }),
    );
    console.log(`Loaded ${meals.length} Thai meals for legacy endpoints.`);
  } catch (error) {
    console.error('Unable to preload Thai meals:', error);
  }
}

app.get('/meals', (req, res) => {
  const algorithm = req.query.sort || 'selection';
  const startedAt = performance.now();
  const sorter =
    algorithm === 'insertion'
      ? insertionSort
      : algorithm === 'bubble'
        ? bubbleSort
        : selectionSort;
  const sortedMeals = sorter(meals);
  res.json({
    algorithm,
    count: sortedMeals.length,
    ms: (performance.now() - startedAt).toFixed(3),
    data: sortedMeals,
  });
});

app.get('/api/search', async (req, res) => {
  const keyword = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!keyword || keyword.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุคำค้นหาไม่เกิน 100 ตัวอักษร',
    });
  }

  try {
    const result = await fetchMealDB('search.php', { s: keyword });
    const data = (result.meals || []).map(normalizeMeal);
    return res.json({ success: true, count: data.length, keyword, data });
  } catch (error) {
    return sendApiError(res, error, 'Meal search failed');
  }
});

app.get('/api/random', async (_req, res) => {
  try {
    const result = await fetchMealDB('random.php', {}, { cacheResponse: false });
    const meal = result.meals?.[0];
    if (!meal) {
      return res.status(502).json({
        success: false,
        message: 'TheMealDB ไม่ได้ส่งข้อมูลเมนูสุ่มกลับมา',
      });
    }
    return res.json({ success: true, data: normalizeMeal(meal) });
  } catch (error) {
    return sendApiError(res, error, 'Random meal request failed');
  }
});

app.get('/api/meals', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const category =
    typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const area = typeof req.query.area === 'string' ? req.query.area.trim() : '';

  try {
    let result;
    if (search) {
      result = (await fetchMealDB('search.php', { s: search })).meals || [];
    } else if (category) {
      result = (await fetchMealDB('filter.php', { c: category })).meals || [];
      result = result.map((meal) => ({ ...meal, strCategory: category }));
    } else if (area) {
      result = (await fetchMealDB('filter.php', { a: area })).meals || [];
      result = result.map((meal) => ({ ...meal, strArea: area }));
    } else {
      result = (await fetchMealDB('filter.php', { a: 'Thai' })).meals || [];
      result = result.slice(0, 50).map((meal) => ({
        ...meal,
        strCategory: 'Thai Food',
        strArea: 'Thai',
      }));
    }

    if (category && search) {
      result = result.filter((meal) => meal.strCategory === category);
    }
    if (area && search) {
      result = result.filter((meal) => meal.strArea === area);
    }

    const data = result.map(normalizeMeal);
    return res.json({
      success: true,
      count: data.length,
      message: data.length ? undefined : 'ไม่พบเมนูอาหารตามเงื่อนไขที่ค้นหา',
      data,
    });
  } catch (error) {
    return sendApiError(res, error, 'Meals API failed');
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
    return res.json({ success: true, data: normalizeMeal(meal) });
  } catch (error) {
    return sendApiError(res, error, 'Meal lookup failed');
  }
});

app.get('/api/ingredients', async (req, res) => {
  const ingredient = typeof req.query.i === 'string' ? req.query.i.trim() : '';
  if (!ingredient || ingredient.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุวัตถุดิบไม่เกิน 100 ตัวอักษร',
    });
  }

  try {
    const result = await fetchMealDB('filter.php', { i: ingredient });
    const data = (result.meals || []).map(normalizeMeal);
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return sendApiError(res, error, 'Ingredient search failed');
  }
});

app.get('/api/ingredient-list', async (_req, res) => {
  try {
    const result = await fetchMealDB('list.php', { i: 'list' });
    const data = [...new Set(
      (result.meals || [])
        .map((item) => item.strIngredient?.trim())
        .filter(Boolean),
    )].sort((first, second) => first.localeCompare(second));
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return sendApiError(res, error, 'Ingredient list failed');
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
    const data = candidates
      .filter((meal) => !candidateIdSet || candidateIdSet.has(meal.idMeal))
      .filter((meal) => hasSelectedIngredients(meal, included, excluded))
      .map(normalizeMeal);
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return sendApiError(res, error, 'Ingredient search failed');
  }
});

app.get('/api/categories', async (_req, res) => {
  try {
    const result = await fetchMealDB('list.php', { c: 'list' });
    const data = (result.meals || []).map((item) => item.strCategory);
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return sendApiError(res, error, 'Category list failed');
  }
});

app.get('/api/areas', async (_req, res) => {
  try {
    const result = await fetchMealDB('list.php', { a: 'list' });
    const data = (result.meals || []).map((item) => item.strArea);
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return sendApiError(res, error, 'Area list failed');
  }
});

class Queue {
  items = [];

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    return this.items[0];
  }

  size() {
    return this.items.length;
  }
}

class Stack {
  items = [];

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  display() {
    return [...this.items].reverse();
  }
}

const watchlist = new Queue();
const history = new Stack();

app.get('/watchlist', (_req, res) => {
  res.json({
    items: watchlist.items,
    size: watchlist.size(),
    next: watchlist.peek() || null,
  });
});

app.post('/watchlist', async (req, res) => {
  try {
    const id = Number(req.body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Meal ID ไม่ถูกต้อง' });
    }
    if (watchlist.items.some((item) => Number(item.id) === id)) {
      return res.status(409).json({ error: 'เมนูนี้อยู่ใน Queue แล้ว' });
    }

    let meal = meals.find((item) => Number(item.id) === id);
    if (!meal) {
      const result = await fetchMealDB('lookup.php', { i: String(id) });
      if (!result.meals?.[0]) {
        return res.status(404).json({ error: 'ไม่พบเมนูอาหารนี้' });
      }
      meal = normalizeMeal(result.meals[0]);
    }

    watchlist.enqueue(meal);
    history.push({ action: 'ADD', meal, time: new Date().toLocaleTimeString('th-TH') });
    return res.status(201).json({
      message: `เพิ่ม ${meal.name} เข้าคิวแล้ว`,
      size: watchlist.size(),
    });
  } catch (error) {
    console.error('Queue add failed:', error);
    return res.status(502).json({ error: 'ไม่สามารถเพิ่มเมนูเข้า Queue ได้' });
  }
});

app.delete('/watchlist/process', (_req, res) => {
  if (watchlist.size() === 0) {
    return res.status(400).json({ error: 'คิวว่าง ไม่มีเมนูให้เลือก' });
  }
  const meal = watchlist.dequeue();
  history.push({ action: 'COOK', meal, time: new Date().toLocaleTimeString('th-TH') });
  return res.json({ message: `เลือก ${meal.name} เรียบร้อย`, size: watchlist.size() });
});

app.delete('/watchlist/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = watchlist.items.findIndex((item) => Number(item.id) === id);
  if (index === -1) {
    return res.status(404).json({ error: 'ไม่พบเมนูนี้ใน Queue' });
  }
  const [meal] = watchlist.items.splice(index, 1);
  history.push({ action: 'REMOVE', meal, time: new Date().toLocaleTimeString('th-TH') });
  return res.json({ message: `นำ ${meal.name} ออกจากคิวแล้ว`, size: watchlist.size() });
});

app.get('/history', (_req, res) => {
  res.json({ history: history.display(), size: history.items.length });
});

function applyUndo(entry) {
  if (entry.action === 'ADD') {
    const index = watchlist.items.findIndex(
      (item) => Number(item.id) === Number(entry.meal.id),
    );
    if (index !== -1) {
      watchlist.items.splice(index, 1);
    }
  } else if (entry.action === 'COOK') {
    if (!watchlist.items.some((item) => Number(item.id) === Number(entry.meal.id))) {
      watchlist.items.unshift(entry.meal);
    }
  } else if (entry.action === 'REMOVE') {
    if (!watchlist.items.some((item) => Number(item.id) === Number(entry.meal.id))) {
      watchlist.enqueue(entry.meal);
    }
  }
}

app.post('/undo/:position', (req, res) => {
  const position = Number(req.params.position);
  if (!Number.isInteger(position) || position < 0 || position >= history.items.length) {
    return res.status(404).json({ error: 'ไม่พบรายการประวัติที่เลือก' });
  }
  const stackIndex = history.items.length - 1 - position;
  const [selected] = history.items.splice(stackIndex, 1);
  applyUndo(selected);
  return res.json({
    message: `ย้อน ${selected.action} ของ ${selected.meal.name} แล้ว`,
    size: watchlist.size(),
  });
});

app.post('/undo', (_req, res) => {
  if (history.isEmpty()) {
    return res.status(400).json({ error: 'ไม่มีอะไรให้ย้อนกลับ' });
  }
  const last = history.pop();
  applyUndo(last);
  return res.json({
    message: `ย้อน ${last.action} ของ ${last.meal.name} แล้ว`,
    size: watchlist.size(),
  });
});

export default app;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  app.listen(PORT, () => {
    console.log(`FoodFinder API listening at http://localhost:${PORT}`);
    loadMeals();
  });
}

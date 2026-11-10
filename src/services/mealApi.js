async function requestApiData(path, options) {
  let response;
  try {
    response = await fetch(path, options);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "เชื่อมต่อ FoodFinder API ไม่ได้ กรุณาตรวจสอบ API URL และสถานะการ Deploy (ในเครื่องให้รัน npm run server)",
    );
  }

  let result;
  try {
    result = await response.json();
  } catch {
    if (response.status === 502) {
      throw new Error(
        "FoodFinder API ยังไม่พร้อมใช้งาน กรุณาตรวจสอบสถานะ Express API หรือ Vercel Function",
      );
    }
    throw new Error("FoodFinder API ส่งข้อมูลที่อ่านไม่ได้กลับมา");
  }

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "ไม่สามารถโหลดข้อมูลเมนูได้");
  }

  if (!("data" in result)) {
    throw new Error("FoodFinder API ตอบกลับโดยไม่มีข้อมูลเมนู");
  }

  return result.data;
}

export async function searchMealsByKeyword(keyword, signal) {
  const meals = await requestApiData(
    `/api/search?q=${encodeURIComponent(keyword)}`,
    { signal },
  );
  if (!Array.isArray(meals)) {
    throw new Error("FoodFinder API ส่งผลการค้นหาในรูปแบบที่ไม่ถูกต้อง");
  }
  return meals;
}

export async function getRandomMeal(signal) {
  const meal = await requestApiData("/api/random", { signal });
  if (!meal || typeof meal !== "object" || !meal.idMeal) {
    throw new Error("FoodFinder API ส่งข้อมูลเมนูสุ่มในรูปแบบที่ไม่ถูกต้อง");
  }
  return meal;
}

export function getMealDetailsById(id, signal) {
  return requestApiData(`/api/meal/${encodeURIComponent(id)}`, { signal });
}

export function filterMealsByIngredient(ingredient) {
  return requestApiData(
    `/api/ingredients?i=${encodeURIComponent(ingredient)}`,
  );
}

export async function getIngredients(signal) {
  const ingredients = await requestApiData("/api/ingredient-list", { signal });
  if (!Array.isArray(ingredients) || ingredients.some((item) => typeof item !== "string")) {
    throw new Error("FoodFinder API ส่งรายการวัตถุดิบในรูปแบบที่ไม่ถูกต้อง");
  }
  return ingredients;
}

export async function searchMealsByIngredients(included, excluded, signal) {
  const meals = await requestApiData("/api/ingredient-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ included, excluded }),
    signal,
  });
  if (!Array.isArray(meals)) {
    throw new Error("FoodFinder API ส่งผลการค้นหาในรูปแบบที่ไม่ถูกต้อง");
  }
  return meals;
}

export function getCategories() {
  return requestApiData("/api/categories");
}

export function getAreas() {
  return requestApiData("/api/areas");
}

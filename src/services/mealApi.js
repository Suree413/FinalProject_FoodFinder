async function requestApiData(path, options) {
  let response;
  try {
    response = await fetch(path, options);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Couldn't connect to FoodFinder. Check the API URL and deployment status (run npm run server locally).",
    );
  }

  let result;
  try {
    result = await response.json();
  } catch {
    if (response.status === 502) {
      throw new Error(
        "FoodFinder is temporarily unavailable. Check the Express API or Vercel Function.",
      );
    }
    throw new Error("FoodFinder returned data we couldn't read.");
  }

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Couldn't load meals.");
  }

  if (!("data" in result)) {
    throw new Error("FoodFinder returned no meal data.");
  }

  return result.data;
}

export async function searchMealsByKeyword(keyword, signal) {
  const meals = await requestApiData(
    `/api/search?q=${encodeURIComponent(keyword)}`,
    { signal },
  );
  if (!Array.isArray(meals)) {
    throw new Error("FoodFinder returned search results in an unexpected format.");
  }
  return meals;
}

export async function getRandomMeal(signal) {
  const meal = await requestApiData("/api/random", { signal });
  if (!meal || typeof meal !== "object" || !meal.idMeal) {
    throw new Error("FoodFinder returned an unexpected random meal.");
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
    throw new Error("FoodFinder returned an unexpected ingredient list.");
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
    throw new Error("FoodFinder returned search results in an unexpected format.");
  }
  return meals;
}

export function getCategories() {
  return requestApiData("/api/categories");
}

export function getAreas() {
  return requestApiData("/api/areas");
}

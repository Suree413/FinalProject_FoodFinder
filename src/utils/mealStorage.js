import { HashTable } from "./HashTable";

export const QUEUE_STORAGE_KEY = "foodfinder_queue";
export const SAVED_STORAGE_KEY = "foodfinder_saved";

export function getMealId(meal) {
  const id = meal?.idMeal ?? meal?.id;
  return id === null || id === undefined || id === "" ? null : String(id);
}

export function readStoredMeals(storageKey) {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return [];

  const meals = JSON.parse(stored);
  if (!Array.isArray(meals)) {
    throw new Error(`ข้อมูลใน Local Storage (${storageKey}) ไม่ถูกต้อง`);
  }
  return meals;
}

export function writeStoredMeals(storageKey, meals) {
  localStorage.setItem(storageKey, JSON.stringify(meals));
}

export function createMealHashTable(meals) {
  const table = new HashTable();
  for (const meal of meals) {
    const id = getMealId(meal);
    if (id !== null) table.set(id, meal);
  }
  return table;
}

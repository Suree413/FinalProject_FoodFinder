import { HashTable } from "./HashTable";
import {
  getMealId,
  QUEUE_STORAGE_KEY,
  readStoredMeals,
  SAVED_STORAGE_KEY,
  writeStoredMeals,
} from "./mealStorage";

export class MealQueue {
  constructor(meals = []) {
    this.items = [];
    this.head = 0;
    this.length = 0;
    this.mealIds = new HashTable();

    for (const meal of meals) {
      this.enqueue(meal);
    }
  }

  enqueue(meal) {
    const id = getMealId(meal);
    if (id === null || this.mealIds.has(id)) return false;

    this.items.push(meal);
    this.mealIds.set(id, true);
    this.length += 1;
    return true;
  }

  dequeue() {
    const meal = this.peek();
    if (meal === null) return null;

    this.head += 1;
    this.length -= 1;
    this.mealIds.remove(getMealId(meal));

    if (this.head > 32 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }

    return meal;
  }

  peek() {
    return this.items[this.head] ?? null;
  }

  has(id) {
    return this.mealIds.has(id);
  }

  remove(id) {
    const normalizedId = String(id);
    if (!this.mealIds.has(normalizedId)) return false;

    const index = this.items.findIndex(
      (meal, itemIndex) =>
        itemIndex >= this.head && getMealId(meal) === normalizedId,
    );
    if (index < 0) return false;

    this.items.splice(index, 1);
    this.mealIds.remove(normalizedId);
    this.length -= 1;
    return true;
  }

  getQueue() {
    return this.items.slice(this.head);
  }

  isEmpty() {
    return this.length === 0;
  }
}

export const getSavedRecipes = () => {
  return readStoredMeals(SAVED_STORAGE_KEY);
};

export const addMealToQueue = (meal) => {
  const queue = new MealQueue(readStoredMeals(QUEUE_STORAGE_KEY));
  if (!queue.enqueue(meal)) return false;

  writeStoredMeals(QUEUE_STORAGE_KEY, queue.getQueue());
  return true;
};

export const saveRecipe = (meal) => {
  const recipes = getSavedRecipes();
  const table = new HashTable();
  for (const recipe of recipes) {
    const id = getMealId(recipe);
    if (id !== null) table.set(id, recipe);
  }

  const id = getMealId(meal);
  if (id === null || table.has(id)) return false;

  table.set(id, meal);
  writeStoredMeals(SAVED_STORAGE_KEY, [...recipes, meal]);
  return true;
};
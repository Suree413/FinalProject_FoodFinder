
// Graph: เก็บความสัมพันธ์ระหว่างหน้าเว็บด้วย Adjacency List

export const pageGraph = {
  Home: ["IngredientFinder", "MealDetail", "Queue", "SavedRecipes"],
  IngredientFinder: ["Home", "MealDetail", "Queue", "SavedRecipes"],
  MealDetail: ["Home", "IngredientFinder", "Queue", "SavedRecipes"],
  Queue: ["Home", "IngredientFinder", "MealDetail", "SavedRecipes"],
  SavedRecipes: ["Home", "IngredientFinder", "MealDetail", "Queue"],
};

// แปลงชื่อหน้าเป็น URL
export const pagePaths = {
  Home: "/",
  IngredientFinder: "/ingredients",
  MealDetail: "/meal/:id",
  Queue: "/queue",
  SavedRecipes: "/saved",
};

// ตรวจสอบว่าหน้าปัจจุบันเชื่อมไปหน้าใดได้บ้าง
export function getConnectedPages(pageName) {
  return pageGraph[pageName] || [];
}

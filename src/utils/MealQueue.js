export class MealQueue {
  constructor() {
    // ดึงข้อมูลคิวเดิมจาก Local Storage ถ้ามี
    const savedQueue = localStorage.getItem('mealQueue');
    this.items = savedQueue ? JSON.parse(savedQueue) : [];
  }

  // เพิ่มเมนูเข้าคิว (Enqueue)
  enqueue(meal) {
    this.items.push(meal);
    this.saveToStorage();
  }

  // เอาเมนูออกจากคิวหน้าสุด (Dequeue)
  dequeue() {
    if (this.isEmpty()) return null;
    const item = this.items.shift();
    this.saveToStorage();
    return item;
  }

  getQueue() {
    return this.items;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  saveToStorage() {
    localStorage.setItem('mealQueue', JSON.stringify(this.items));
  }
}

// ฟังก์ชันช่วยจัดการ Saved Recipes (เมนูโปรด) ใน Local Storage
export const getSavedRecipes = () => {
  const saved = localStorage.getItem('savedRecipes');
  return saved ? JSON.parse(saved) : [];
};

export const saveRecipe = (meal) => {
  const recipes = getSavedRecipes();
  const exists = recipes.some((item) => item.id === meal.id);
  if (!exists) {
    recipes.push(meal);
    localStorage.setItem('savedRecipes', JSON.stringify(recipes));
  }
};
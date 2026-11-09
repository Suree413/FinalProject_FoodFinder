const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export async function searchMealsByKeyword(keyword) {
  try {
    const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error('ไม่สามารถเชื่อมต่อ API ได้');
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    throw new Error(error.message || 'เกิดข้อผิดพลาดในการค้นหา');
  }
}

export async function getMealDetailsById(id) {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    if (!response.ok) throw new Error('ไม่สามารถเชื่อมต่อ API ได้');
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    throw new Error(error.message || 'เกิดข้อผิดพลาดในการโหลดรายละเอียด');
  }
}

export async function filterMealsByIngredient(ingredient) {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
    if (!response.ok) throw new Error('ไม่สามารถเชื่อมต่อ API ได้');
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    throw new Error(error.message || 'เกิดข้อผิดพลาดในการกรองวัตถุดิบ');
  }
}

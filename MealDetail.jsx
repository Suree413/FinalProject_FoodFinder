import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMealDetailsById } from "../services/mealApi";

function MealDetail() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMealDetailsById(id);
        if (data) {
          setMeal(data);
        } else {
          setError("ไม่พบข้อมูลเมนูอาหาร");
        }
      } catch (err) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [id]);

  const getIngredients = () => {
    if (!meal) return [];
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({ name: ingredient, measure: measure || "" });
      }
    }
    return ingredients;
  };

  const addToQueue = () => {
    const queue = JSON.parse(localStorage.getItem("foodfinder_queue") || "[]");
    if (queue.some(item => item.idMeal === meal.idMeal)) {
      alert("เมนูนี้อยู่ใน Queue แล้ว");
      return;
    }
    queue.push(meal);
    localStorage.setItem("foodfinder_queue", JSON.stringify(queue));
    alert("เพิ่มเมนูเข้า Queue แล้ว!");
  };

  const saveRecipe = () => {
    const saved = JSON.parse(localStorage.getItem("foodfinder_saved") || "[]");
    if (saved.some(item => item.idMeal === meal.idMeal)) {
      alert("เมนูนี้ถูกบันทึกไว้แล้ว");
      return;
    }
    saved.push(meal);
    localStorage.setItem("foodfinder_saved", JSON.stringify(saved));
    alert("บันทึกเมนูโปรดเรียบร้อย!");
  };

  if (loading) return <h2>กำลังโหลดรายละเอียดอาหาร...</h2>;
  if (error) return <div><h2>{error}</h2><Link to="/">กลับหน้าหลัก</Link></div>;
  if (!meal) return null;

  return (
    <div className="meal-detail">
      <Link to="/">← กลับหน้าหลัก</Link>
      <h1>{meal.strMeal}</h1>
      <img src={meal.strMealThumb} alt={meal.strMeal} width="350" style={{ borderRadius: "8px" }} />
      <p><strong>Category:</strong> {meal.strCategory}</p>
      <p><strong>Area:</strong> {meal.strArea}</p>
      <div className="detail-buttons" style={{ margin: "15px 0" }}>
        <button onClick={addToQueue} style={{ marginRight: "10px", padding: "8px 12px" }}>➕ เพิ่มเข้า Queue</button>
        <button onClick={saveRecipe} style={{ padding: "8px 12px" }}>❤️ บันทึกเมนูโปรด</button>
      </div>
      <h2>🥕 Ingredients</h2>
      <ul>
        {getIngredients().map((item, index) => (
          <li key={index}>{item.name} - {item.measure}</li>
        ))}
      </ul>
      <h2>👩‍🍳 Instructions</h2>
      <p style={{ whiteSpace: "pre-line" }}>{meal.strInstructions}</p>
      {meal.strYoutube && (
        <p style={{ marginTop: "15px" }}>
          <a href={meal.strYoutube} target="_blank" rel="noreferrer">▶ Watch Cooking Video</a>
        </p>
      )}
    </div>
  );
}

export default MealDetail;

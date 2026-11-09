
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { getMealDetailsById } from "../services/mealApi";
import { useNavigationHistory } from "../context/navigationHistoryContext";
import {
  addMealToQueue,
  saveRecipe as saveRecipeToStorage,
} from "../utils/MealQueue";

function MealDetail() {
  const { id } = useParams();
  const goBack = useNavigationHistory();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storageMessage, setStorageMessage] = useState("");
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchMeal = async () => {
      setLoading(true);
      setError("");
      setMeal(null);

      try {
        const result = await getMealDetailsById(id, controller.signal);
        setMeal(result);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "เกิดข้อผิดพลาด");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMeal();

    return () => controller.abort();
  }, [id]);

  // ดึงรายการวัตถุดิบและปริมาณ
  const getIngredients = () => {
    if (!meal) return [];

    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient,
          measure: measure || "",
        });
      }
    }

    return ingredients;
  };

  const addToQueue = () => {
    try {
      if (!addMealToQueue(meal)) {
        setStorageError(true);
        setStorageMessage("เมนูนี้อยู่ใน Queue แล้ว");
        return;
      }

      setStorageError(false);
      setStorageMessage("เพิ่มเมนูเข้า Queue แล้ว");
    } catch (storageException) {
      setStorageError(true);
      setStorageMessage(storageException.message || "เพิ่มเมนูเข้า Queue ไม่สำเร็จ");
    }
  };

  const saveRecipe = () => {
    try {
      if (!saveRecipeToStorage(meal)) {
        setStorageError(true);
        setStorageMessage("เมนูนี้ถูกบันทึกไว้แล้ว");
        return;
      }

      setStorageError(false);
      setStorageMessage("บันทึกเมนูโปรดเรียบร้อย");
    } catch (storageException) {
      setStorageError(true);
      setStorageMessage(storageException.message || "บันทึกเมนูโปรดไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="meal-detail">
        <button className="back-button" onClick={goBack}>← ย้อนกลับ</button>
        <Loading message="กำลังโหลดรายละเอียดอาหาร..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="meal-detail">
        <button className="back-button" onClick={goBack}>← ย้อนกลับ</button>
        <h2>{error}</h2>
      </div>
    );
  }

  if (!meal) return null;

  return (
    <div className="meal-detail">
      <button className="back-button" onClick={goBack}>← ย้อนกลับ</button>

      <h1>{meal.strMeal}</h1>

      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
        width="350"
      />

      <p>
        <strong>Category:</strong> {meal.strCategory}
      </p>

      <p>
        <strong>Area:</strong> {meal.strArea}
      </p>

      <div className="detail-buttons">
        <button onClick={addToQueue}>
          ➕ เพิ่มเข้า Queue
        </button>

        <button onClick={saveRecipe}>
          ❤️ บันทึกเมนูโปรด
        </button>
      </div>
      {storageMessage && (
        <p
          className={`status-message${storageError ? " error-message" : ""}`}
          role={storageError ? "alert" : "status"}
        >
          {storageMessage}
        </p>
      )}

      <h2>🥕 Ingredients</h2>

      <ul>
        {getIngredients().map((item, index) => (
          <li key={index}>
            {item.name} - {item.measure}
          </li>
        ))}
      </ul>

      <h2>👩‍🍳 Instructions</h2>

      <p style={{ whiteSpace: "pre-line" }}>
        {meal.strInstructions}
      </p>

      {meal.strYoutube && (
        <a
          href={meal.strYoutube}
          target="_blank"
          rel="noreferrer"
        >
          ▶ Watch Cooking Video
        </a>
      )}
    </div>
  );
}

export default MealDetail;

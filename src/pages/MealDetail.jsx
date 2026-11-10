
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import Toast from "../components/Toast";
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
  const [queueAdded, setQueueAdded] = useState(false);
  const [toast, setToast] = useState(null);
  const toastId = useRef(0);

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
          setError(requestError.message || "Something went wrong.");
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
        setToast({
          id: ++toastId.current,
          variant: "warning",
          message: "This meal is already in your Queue.",
        });
        return;
      }

      setQueueAdded(true);
      setToast({
        id: ++toastId.current,
        variant: "success",
        mealName: meal.strMeal,
      });
    } catch {
      setToast({
        id: ++toastId.current,
        variant: "error",
        message: "Couldn't add this meal to your Queue. Please try again.",
        mealName: meal.strMeal,
      });
    }
  };

  const saveRecipe = () => {
    try {
      if (!saveRecipeToStorage(meal)) {
        setStorageError(true);
        setStorageMessage("This meal is already saved.");
        return;
      }

      setStorageError(false);
      setStorageMessage("Saved to your recipes.");
    } catch (storageException) {
      setStorageError(true);
      setStorageMessage(storageException.message || "Couldn't save this recipe.");
    }
  };

  if (loading) {
    return (
      <div className="meal-detail">
        <button className="back-button" onClick={goBack}>← Back</button>
        <Loading message="Loading your recipe..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="meal-detail">
        <button className="back-button" onClick={goBack}>← Back</button>
        <h2>{error}</h2>
      </div>
    );
  }

  if (!meal) return null;

  const instructions = (meal.strInstructions || "")
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((step) => step.trim())
    .filter(Boolean);

  return (
    <div className="meal-detail">
      <button className="back-button" onClick={goBack}>← Back</button>

      <section className="recipe-hero">
        <div className="recipe-heading">
          <p className="eyebrow">From the Food Finder kitchen</p>
          <h1>{meal.strMeal}</h1>
          <div className="recipe-meta">
            {meal.strCategory && <span>{meal.strCategory}</span>}
            {meal.strArea && <span>{meal.strArea}</span>}
          </div>
          <p className="recipe-intro">A recipe worth slowing down for. Gather your ingredients and enjoy every step.</p>
          <div className="detail-buttons">
            <button className="primary-button" onClick={addToQueue}>
              {queueAdded ? "Added to Queue ✓" : "Add to Queue"}
            </button>
            <button className="secondary-button" onClick={saveRecipe}>Save Recipe</button>
          </div>
        </div>
        <img className="recipe-image" src={meal.strMealThumb} alt={meal.strMeal} />
      </section>

      <div className="recipe-content">
        <section className="recipe-ingredients">
          <p className="eyebrow">What you'll need</p>
          <h2>Ingredients</h2>
          <ul>
            {getIngredients().map((item, index) => (
              <li key={index}>
                <span>{item.name}</span>
                <span>{item.measure}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="recipe-instructions">
          <p className="eyebrow">Made with care</p>
          <h2>Method</h2>
          <ol>
            {instructions.map((step, index) => (
              <li key={`${index}-${step}`}>
                <span className="instruction-number">{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          {meal.strYoutube && (
            <a className="video-link" href={meal.strYoutube} target="_blank" rel="noreferrer">
              Watch the cooking video <span aria-hidden="true">↗</span>
            </a>
          )}
        </section>
      </div>
      {storageMessage && (
        <p
          className={`status-message${storageError ? " error-message" : ""}`}
          role={storageError ? "alert" : "status"}
        >
          {storageMessage}
        </p>
      )}
      {toast && (
        <Toast
          key={toast.id}
          variant={toast.variant}
          message={toast.message}
          mealName={toast.mealName}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default MealDetail;

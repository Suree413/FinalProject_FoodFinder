import { useState } from "react";
import MealCard from "../components/MealCard";
import { createMealHashTable, getMealId, readStoredMeals, SAVED_STORAGE_KEY, writeStoredMeals } from "../utils/mealStorage";

function SavedRecipes() {
  const [saved, setSaved] = useState(() => readStoredMeals(SAVED_STORAGE_KEY));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const removeRecipe = (id) => {
    const recipesById = createMealHashTable(saved);
    if (!recipesById.remove(id)) return;

    const updated = saved.filter((meal) => getMealId(meal) !== String(id));

    try {
      writeStoredMeals(SAVED_STORAGE_KEY, updated);
      setSaved(updated);
      setMessage("Removed from your saved recipes.");
      setError("");
    } catch (storageError) {
      setError(storageError.message || "Couldn't update your saved recipes.");
    }
  };

  return (
    <div className="saved-page">
      <h1>❤️ Saved Recipes</h1>
      <p>Your favorite meals, all in one place.</p>

      {error && <p className="status-message error-message">{error}</p>}
      {message && !error && (
        <p className="status-message" role="status">{message}</p>
      )}

      {saved.length === 0 ? (
        <p>No saved recipes yet. Save a meal to see it here!</p>
      ) : (
        <div className="meal-grid">
          {saved.map((meal) => (
            <MealCard
              key={meal.idMeal}
              meal={meal}
              actionLabel="Remove from saved"
              onAction={(item) => removeRecipe(item.idMeal)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedRecipes;

import { useState } from "react";
import { Link } from "react-router-dom";
import { filterMealsByIngredient } from "../services/mealApi";

function IngredientFinder() {
  const [ingredients, setIngredients] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchByIngredients = async (e) => {
    e.preventDefault();
    const items = ingredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length === 0) {
      setError("Enter at least one ingredient.");
      return;
    }

    setLoading(true);
    setError("");
    setMeals([]);

    try {
      const results = await Promise.all(
        items.map((ingredient) => filterMealsByIngredient(ingredient))
      );

      if (results[0].length === 0) {
        setError("No meals found with this ingredient.");
        setLoading(false);
        return;
      }

      const commonMeals = results[0].filter((meal) =>
        results.every((result) =>
          result.some((item) => item.idMeal === meal.idMeal)
        )
      );

      setMeals(commonMeals);
      if (commonMeals.length === 0) {
        setError("No meals match all of these ingredients.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ingredient-page">
      <h1>🥕 Ingredient Finder</h1>
      <p>Find meals with ingredients you already have.</p>

      <form onSubmit={searchByIngredients} style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="e.g. chicken, garlic, onion"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          style={{ padding: "8px", marginRight: "8px", width: "300px" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find meals"}
        </button>
      </form>

      <p style={{ fontSize: "14px", color: "#666" }}>Add multiple ingredients, separated by commas.</p>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <div className="meal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginTop: "20px" }}>
        {meals.map((meal) => (
          <div className="meal-card" key={meal.idMeal} style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "8px" }}>
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              width="100%"
              style={{ borderRadius: "6px" }}
            />
            <h3>{meal.strMeal}</h3>
            <Link to={`/meal/${meal.idMeal}`}>View recipe</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IngredientFinder;

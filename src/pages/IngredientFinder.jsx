import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import MealCard from "../components/MealCard";
import SearchBar from "../components/SearchBar";
import {
  getIngredients,
  searchMealsByIngredients,
} from "../services/mealApi";

function IngredientPicker({
  id,
  label,
  ingredients,
  selectedIngredients,
  unavailableIngredients,
  searchValue,
  onSearchChange,
  onToggle,
  onRemove,
  disabled,
}) {
  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.toLocaleLowerCase().includes(searchValue.trim().toLocaleLowerCase()),
  );

  return (
    <section className="ingredient-picker" aria-labelledby={`${id}-label`}>
      <label id={`${id}-label`} htmlFor={`${id}-search`}>
        {label}
      </label>
      <input
        id={`${id}-search`}
        type="search"
        placeholder="Search ingredients..."
        value={searchValue}
        disabled={disabled}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <p className="ingredient-hint">
        Pick as many as you like. Ingredients chosen in the other list can't be selected again.
      </p>

      <div className="ingredient-options" role="group" aria-labelledby={`${id}-label`}>
        {filteredIngredients.map((ingredient) => (
          <label className="ingredient-option" key={ingredient}>
            <input
              type="checkbox"
              checked={selectedIngredients.includes(ingredient)}
              disabled={disabled || unavailableIngredients.includes(ingredient)}
              onChange={() => onToggle(ingredient)}
            />
            <span>{ingredient}</span>
          </label>
        ))}
        {filteredIngredients.length === 0 && (
          <p className="ingredient-hint">No ingredients found.</p>
        )}
      </div>

      <div className="selected-ingredients" aria-live="polite">
        <p>{selectedIngredients.length} selected</p>
        {selectedIngredients.length > 0 && (
          <ul className="ingredient-chips">
            {selectedIngredients.map((ingredient) => (
              <li key={ingredient}>
                <span>{ingredient}</span>
                <button
                  type="button"
                  aria-label={`Remove ${ingredient} from ${label}`}
                  disabled={disabled}
                  onClick={() => onRemove(ingredient)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function IngredientFinder() {
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [ingredientListLoading, setIngredientListLoading] = useState(true);
  const [ingredientListError, setIngredientListError] = useState("");
  const [includedIngredients, setIncludedIngredients] = useState([]);
  const [excludedIngredients, setExcludedIngredients] = useState([]);
  const [includeSearch, setIncludeSearch] = useState("");
  const [excludeSearch, setExcludeSearch] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getIngredients(controller.signal)
      .then(setAvailableIngredients)
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setIngredientListError(
            requestError.message || "Couldn't load the ingredient list.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIngredientListLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const searchByIngredients = async (event) => {
    event.preventDefault();

    if (includedIngredients.length === 0 && excludedIngredients.length === 0) {
      setMeals([]);
      setSearched(false);
      setError("Choose at least one ingredient.");
      return;
    }

    setLoading(true);
    setError("");
    setMeals([]);
    setSearched(true);

    try {
      const results = await searchMealsByIngredients(
        includedIngredients,
        excludedIngredients,
      );
      setMeals(results);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setIncludedIngredients([]);
    setExcludedIngredients([]);
    setIncludeSearch("");
    setExcludeSearch("");
    setMeals([]);
    setError("");
    setSearched(false);
  };

  const updateIngredientSelection = (setSelection, update) => {
    setSelection(update);
    setMeals([]);
    setError("");
    setSearched(false);
  };

  const toggleIngredient = (setSelection, ingredient) => {
    updateIngredientSelection(setSelection, (current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    );
  };

  const removeIngredient = (setSelection, ingredient) => {
    updateIngredientSelection(setSelection, (current) =>
      current.filter((item) => item !== ingredient),
    );
  };

  return (
    <div className="ingredient-page">
      <h1>🥕 Ingredient Finder</h1>
      <p>Choose ingredients to include or skip, and find a meal that fits.</p>

      {ingredientListLoading && (
        <Loading message="Loading ingredients from TheMealDB..." />
      )}
      {ingredientListError && (
        <p className="status-message error-message" role="alert">
          {ingredientListError}
        </p>
      )}

      {!ingredientListLoading && !ingredientListError && (
        <SearchBar
          className="ingredient-search"
          loading={loading}
          onSubmit={searchByIngredients}
          submitLabel="Find meals"
          extraActions={
            <button type="button" onClick={clearSearch} disabled={loading}>
              Clear all
            </button>
          }
        >
          <div className="ingredient-pickers">
            <IngredientPicker
              id="available-ingredients"
              label="Include ingredients"
              ingredients={availableIngredients}
              selectedIngredients={includedIngredients}
              unavailableIngredients={excludedIngredients}
              searchValue={includeSearch}
              onSearchChange={setIncludeSearch}
              disabled={loading}
              onToggle={(ingredient) =>
                toggleIngredient(
                  setIncludedIngredients,
                  ingredient,
                )
              }
              onRemove={(ingredient) =>
                removeIngredient(
                  setIncludedIngredients,
                  ingredient,
                )
              }
            />
            <IngredientPicker
              id="excluded-ingredients"
              label="Exclude ingredients"
              ingredients={availableIngredients}
              selectedIngredients={excludedIngredients}
              unavailableIngredients={includedIngredients}
              searchValue={excludeSearch}
              onSearchChange={setExcludeSearch}
              disabled={loading}
              onToggle={(ingredient) =>
                toggleIngredient(
                  setExcludedIngredients,
                  ingredient,
                )
              }
              onRemove={(ingredient) =>
                removeIngredient(
                  setExcludedIngredients,
                  ingredient,
                )
              }
            />
          </div>
        </SearchBar>
      )}

      {error && (
        <p className="status-message error-message" role="alert">
          {error}
        </p>
      )}
      {!error && loading && <Loading message="Finding meals..." />}
      {!error && !loading && searched && meals.length === 0 && (
        <p className="status-message">No meals match those ingredients.</p>
      )}
      {!error && !loading && !searched && !ingredientListLoading && !ingredientListError && (
        <p className="status-message">
          Choose at least one ingredient, then search for meals.
        </p>
      )}

      <div className="meal-grid">
        {meals.map((meal) => (
          <MealCard key={meal.idMeal} meal={meal} />
        ))}
      </div>
    </div>
  );
}

export default IngredientFinder;

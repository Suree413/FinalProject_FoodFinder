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
        placeholder="ค้นหาวัตถุดิบ..."
        value={searchValue}
        disabled={disabled}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <p className="ingredient-hint">
        เลือกได้หลายรายการ รายการที่เลือกในอีกส่วนจะไม่สามารถเลือกซ้ำได้
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
          <p className="ingredient-hint">ไม่พบวัตถุดิบที่ค้นหา</p>
        )}
      </div>

      <div className="selected-ingredients" aria-live="polite">
        <p>เลือกแล้ว {selectedIngredients.length} รายการ</p>
        {selectedIngredients.length > 0 && (
          <ul className="ingredient-chips">
            {selectedIngredients.map((ingredient) => (
              <li key={ingredient}>
                <span>{ingredient}</span>
                <button
                  type="button"
                  aria-label={`ลบ ${ingredient} จาก${label}`}
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
            requestError.message || "ไม่สามารถโหลดรายการวัตถุดิบได้",
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
      setError("กรุณาเลือกวัตถุดิบอย่างน้อย 1 รายการ");
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
      setError(requestError.message || "เกิดข้อผิดพลาดในการค้นหา");
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
      <p>เลือกวัตถุดิบที่มีและวัตถุดิบที่ไม่ต้องการ เพื่อค้นหาเมนูที่ตรงเงื่อนไข</p>

      {ingredientListLoading && (
        <Loading message="กำลังโหลดรายการวัตถุดิบจาก TheMealDB..." />
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
          submitLabel="ค้นหาเมนู"
          extraActions={
            <button type="button" onClick={clearSearch} disabled={loading}>
              ล้างทั้งหมด
            </button>
          }
        >
          <div className="ingredient-pickers">
            <IngredientPicker
              id="available-ingredients"
              label="วัตถุดิบที่มี"
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
              label="วัตถุดิบที่ไม่ต้องการ"
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
      {!error && loading && <Loading message="กำลังค้นหาเมนู..." />}
      {!error && !loading && searched && meals.length === 0 && (
        <p className="status-message">ไม่พบเมนูที่ตรงกับวัตถุดิบที่เลือก</p>
      )}
      {!error && !loading && !searched && !ingredientListLoading && !ingredientListError && (
        <p className="status-message">
          เลือกวัตถุดิบอย่างน้อย 1 รายการจากส่วนใดส่วนหนึ่ง แล้วกดค้นหาเมนู
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


import { useEffect, useRef, useState } from "react";
import Loading from "../components/Loading";
import MealCard from "../components/MealCard";
import SearchBar from "../components/SearchBar";
import Toast from "../components/Toast";
import { addMealToQueue, saveRecipe } from "../utils/MealQueue";
import {
  getAreas,
  getCategories,
  getRandomMeal,
  searchMealsByKeyword,
} from "../services/mealApi";

function Home() {
  const initialSearch = "chicken";
  const searchRequestId = useRef(0);
  const toastId = useRef(0);
  const [keyword, setKeyword] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [showingRecommendations, setShowingRecommendations] = useState(true);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterOptionsError, setFilterOptionsError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState(false);
  const [addedQueueIds, setAddedQueueIds] = useState(() => new Set());
  const [toast, setToast] = useState(null);

  const includeMealFilterOptions = (results) => {
    setCategories((current) => [
      ...new Set([
        ...current,
        ...results.map((meal) => meal.strCategory).filter(Boolean),
      ]),
    ]);
    setAreas((current) => [
      ...new Set([
        ...current,
        ...results.map((meal) => meal.strArea).filter(Boolean),
      ]),
    ]);
  };

  useEffect(() => {
    const requestId = ++searchRequestId.current;
    const controller = new AbortController();

    const loadRecommendations = async () => {
      setLoading(true);
      setError("");

      try {
        const results = await searchMealsByKeyword(
          initialSearch,
          controller.signal,
        );
        if (requestId !== searchRequestId.current) return;

        setMeals(results);
        setSearched(true);
        includeMealFilterOptions(results);
      } catch (requestError) {
        if (
          requestError.name !== "AbortError" &&
          requestId === searchRequestId.current
        ) {
          setError(requestError.message || "Couldn't load meal ideas.");
        }
      } finally {
        if (requestId === searchRequestId.current) {
          setLoading(false);
        }
      }
    };

    loadRecommendations();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([getCategories(), getAreas()])
      .then(([categoryOptions, areaOptions]) => {
        if (!active) return;
        setCategories([...new Set(categoryOptions)]);
        setAreas([...new Set(areaOptions)]);
      })
      .catch((requestError) => {
        if (active) {
          setFilterOptionsError(
            requestError.message || "Couldn't load category and area filters.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const searchMeals = async (e) => {
    e.preventDefault();
    const requestId = ++searchRequestId.current;

    if (!keyword.trim()) {
      setMeals([]);
      setSearched(false);
      setShowingRecommendations(false);
      setError("Type a meal name to get started.");
      return;
    }

    setLoading(true);
    setError("");
    setMeals([]);
    setSearched(true);
    setShowingRecommendations(false);

    try {
      const results = await searchMealsByKeyword(keyword.trim());
      if (requestId !== searchRequestId.current) return;
      setMeals(results);
      includeMealFilterOptions(results);
    } catch (err) {
      if (requestId === searchRequestId.current) {
        setError(err.message || "Something went wrong while searching.");
      }
    } finally {
      if (requestId === searchRequestId.current) {
        setLoading(false);
      }
    }
  };

  const loadRandomMeal = async () => {
    const requestId = ++searchRequestId.current;
    setLoading(true);
    setError("");
    setMeals([]);
    setSearched(true);
    setShowingRecommendations(false);
    setCategory("");
    setArea("");

    try {
      const meal = await getRandomMeal();
      if (requestId !== searchRequestId.current) return;
      setMeals([meal]);
      includeMealFilterOptions([meal]);
    } catch (requestError) {
      if (requestId === searchRequestId.current) {
        setError(requestError.message || "Couldn't find a surprise meal.");
      }
    } finally {
      if (requestId === searchRequestId.current) {
        setLoading(false);
      }
    }
  };

  const visibleMeals = [...meals]
    .filter((meal) => !category || meal.strCategory === category)
    .filter((meal) => !area || meal.strArea === area)
    .sort((first, second) => {
      const direction = sortOrder === "asc" ? 1 : -1;
      return direction * first.strMeal.localeCompare(second.strMeal, undefined, {
        sensitivity: "base",
      });
    });

  const showToast = (toastData) => {
    setToast({ ...toastData, id: ++toastId.current });
  };

  const handleMealAction = (action, meal) => {
    try {
      if (action === "queue") {
        const added = addMealToQueue(meal);
        if (added) {
          setAddedQueueIds((current) => new Set(current).add(String(meal.idMeal)));
          showToast({ variant: "success", mealName: meal.strMeal });
        } else {
          showToast({
            variant: "warning",
            message: "This meal is already in your Queue.",
          });
        }
        return;
      }

      const added = saveRecipe(meal);
      setActionError(!added);
      setActionMessage(
        added ? `Saved ${meal.strMeal} to your recipes.` : "This meal is already saved.",
      );
    } catch (storageError) {
      if (action === "queue") {
        showToast({
          variant: "error",
          message: "Couldn't add this meal to your Queue. Please try again.",
          mealName: meal.strMeal,
        });
        return;
      }
      setActionError(true);
      setActionMessage(storageError.message || "Couldn't save this meal.");
    }
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">A little inspiration for your table</p>
          <h1>Discover Something Delicious.</h1>
          <p className="hero-description">
            Thoughtful recipes, beautiful ingredients, and something wonderful
            to make tonight.
          </p>
        </div>
        <div className="home-hero-image">
          <img
            src={meals[0]?.strMealThumb || "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85"}
            alt={meals[0]?.strMeal || "A beautifully prepared meal"}
          />
          <span className="hero-image-caption">
            {showingRecommendations ? "Freshly picked" : "Find your next favorite"}
          </span>
        </div>
      </section>

      <SearchBar
        className="home-search"
        loading={loading}
        onSubmit={searchMeals}
        submitLabel="Search"
        extraActions={
          <button className="secondary-button" type="button" onClick={loadRandomMeal} disabled={loading}>
            Surprise me
          </button>
        }
      >
        <input
          type="text"
          placeholder="What are you craving?"
          aria-label="Search meals"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </SearchBar>

      <div className="home-filters">
        <label>
          Category
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Area
          <select
            aria-label="Filter by area"
            value={area}
            onChange={(event) => setArea(event.target.value)}
          >
            <option value="">All areas</option>
            {areas.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Sort
          <select
            aria-label="Sort meals"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="asc">A–Z</option>
            <option value="desc">Z–A</option>
          </select>
        </label>
      </div>

      {filterOptionsError && !error && (
        <p className="status-message error-message">{filterOptionsError}</p>
      )}
      {actionMessage && (
        <p
          className={`status-message${actionError ? " error-message" : ""}`}
          role={actionError ? "alert" : "status"}
        >
          {actionMessage}
        </p>
      )}
      {error && <p className="status-message error-message">{error}</p>}
      {!error && loading && (
        <Loading
          message={
            showingRecommendations
              ? "Cooking up fresh ideas..."
              : "Finding tasty meals..."
          }
        />
      )}
      {!error && !loading && searched && visibleMeals.length === 0 && (
        <p className="status-message">No meals found. Try another search!</p>
      )}
      {!error && !loading && searched && visibleMeals.length > 0 && (
        <p className="status-message" role="status">
          Found {visibleMeals.length} meals
        </p>
      )}

      {visibleMeals.length > 0 && !loading && (
        <div className="section-heading">
          <div>
            <p className="eyebrow">The recipe collection</p>
            <h2>{showingRecommendations ? "Editor's picks" : "Recipes to explore"}</h2>
          </div>
          <span>{visibleMeals.length} {visibleMeals.length === 1 ? "recipe" : "recipes"}</span>
        </div>
      )}
      <div className="meal-grid">
        {visibleMeals.map((meal) => (
          <MealCard
            key={meal.idMeal}
            meal={meal}
            actions={[
              {
                label: addedQueueIds.has(String(meal.idMeal))
                  ? "Added to Queue ✓"
                  : "Add to Queue",
                onAction: (item) => handleMealAction("queue", item),
              },
              {
                label: "Save recipe",
                onAction: (item) => handleMealAction("saved", item),
              },
            ]}
          />
        ))}
      </div>
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

export default Home;

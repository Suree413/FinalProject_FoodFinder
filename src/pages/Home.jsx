
import { useEffect, useRef, useState } from "react";
import Loading from "../components/Loading";
import MealCard from "../components/MealCard";
import SearchBar from "../components/SearchBar";
import { addMealToQueue, saveRecipe } from "../utils/MealQueue";
import {
  getAreas,
  getCategories,
  searchMealsByKeyword,
} from "../services/mealApi";

function Home() {
  const initialSearch = "chicken";
  const searchRequestId = useRef(0);
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
          setError(requestError.message || "โหลดเมนูแนะนำไม่สำเร็จ");
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
            requestError.message || "โหลดตัวกรอง Category/Area ไม่สำเร็จ",
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
      setError("กรุณาพิมพ์ชื่อเมนูอาหาร");
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
        setError(err.message || "เกิดข้อผิดพลาดในการค้นหา");
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

  const handleMealAction = (action, meal) => {
    try {
      const added = action === "queue"
        ? addMealToQueue(meal)
        : saveRecipe(meal);
      setActionError(!added);
      setActionMessage(
        added
          ? action === "queue"
            ? `เพิ่ม ${meal.strMeal} เข้า Queue แล้ว`
            : `บันทึก ${meal.strMeal} แล้ว`
          : action === "queue"
            ? "เมนูนี้อยู่ใน Queue แล้ว"
            : "เมนูนี้ถูกบันทึกไว้แล้ว",
      );
    } catch (storageError) {
      setActionError(true);
      setActionMessage(storageError.message || "บันทึกเมนูไม่สำเร็จ");
    }
  };

  return (
    <div className="home-page">
      <h1>🍽️ Welcome to FoodFinder</h1>
      <p>
        {showingRecommendations
          ? "เมนูแนะนำจาก TheMealDB"
          : "ค้นหาเมนูอาหารที่คุณชื่นชอบ"}
      </p>

      <SearchBar
        className="home-search"
        loading={loading}
        onSubmit={searchMeals}
        submitLabel="Search"
      >
        <input
          type="text"
          placeholder="ค้นหาชื่ออาหาร..."
          aria-label="ค้นหาชื่ออาหาร"
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
            <option value="">ทุก Category</option>
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
            <option value="">ทุก Area</option>
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
              ? "กำลังโหลดเมนูแนะนำจาก TheMealDB..."
              : "กำลังค้นหาเมนู..."
          }
        />
      )}
      {!error && !loading && searched && visibleMeals.length === 0 && (
        <p className="status-message">ไม่พบเมนูอาหารที่ค้นหา</p>
      )}
      {!error && !loading && searched && visibleMeals.length > 0 && (
        <p className="status-message" role="status">
          พบ {visibleMeals.length} เมนู
        </p>
      )}

      <div className="meal-grid">
        {visibleMeals.map((meal) => (
          <MealCard
            key={meal.idMeal}
            meal={meal}
            actions={[
              {
                label: "เพิ่มเข้า Queue",
                onAction: (item) => handleMealAction("queue", item),
              },
              {
                label: "บันทึกเมนู",
                onAction: (item) => handleMealAction("saved", item),
              },
            ]}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;

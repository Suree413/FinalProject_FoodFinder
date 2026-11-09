import { Link, useLocation } from "react-router-dom";
import { getConnectedPages, pagePaths } from "../utils/Graph";
import "./Navigation.css";

const pageLabels = {
  Home: "ค้นหาเมนู",
  IngredientFinder: "ค้นหาจากวัตถุดิบ",
  Queue: "คิวเมนู",
  SavedRecipes: "เมนูที่บันทึก",
};

function Navigation() {
  const location = useLocation();
  const currentPage =
    location.pathname.startsWith("/meal/")
      ? "MealDetail"
      : Object.entries(pagePaths).find(
          ([name, path]) => name !== "MealDetail" && path === location.pathname,
        )?.[0] || "Home";
  const connectedPages = [currentPage, ...getConnectedPages(currentPage)].filter(
    (pageName) => pageName !== "MealDetail",
  );

  return (
    <nav className="main-navigation">
      <Link to="/" className="nav-brand">
        🍽️ FoodFinder
      </Link>

      <div className="nav-links">
        {connectedPages.map((pageName) => (
            <Link
              key={pageName}
              to={pagePaths[pageName]}
              className={pageName === currentPage ? "nav-link active" : "nav-link"}
            >
              {pageLabels[pageName]}
            </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navigation;

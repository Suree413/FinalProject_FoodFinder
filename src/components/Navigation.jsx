import { Link, useLocation } from "react-router-dom";
import { getConnectedPages, pagePaths } from "../utils/Graph";
import "./Navigation.css";

const pageLabels = {
  Home: "Find Meals",
  IngredientFinder: "By Ingredient",
  Queue: "My Queue",
  SavedRecipes: "Saved Recipes",
};

const primaryPages = ["Home", "IngredientFinder", "Queue", "SavedRecipes"];

const pageIcons = {
  Home: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.4 15.4 4.1 4.1" />
    </svg>
  ),
  IngredientFinder: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19.5 4.5c-7.8.1-13.2 2.4-13.2 8.1a5.4 5.4 0 0 0 5.4 5.4c5.8 0 7.9-5.8 7.8-13.5Z" />
      <path d="M5 21c2.4-5.1 5.8-8.5 10.1-11.2" />
    </svg>
  ),
  Queue: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5H5.8A1.8 1.8 0 0 0 4 6.8v12.4A1.8 1.8 0 0 0 5.8 21h12.4a1.8 1.8 0 0 0 1.8-1.8V6.8A1.8 1.8 0 0 0 18.2 5H16" />
      <path d="M8 3h8v4H8zM8 12h8M8 16h5" />
    </svg>
  ),
  SavedRecipes: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.4 8.7c0 4.1-8.4 10-8.4 10s-8.4-5.9-8.4-10A4.4 4.4 0 0 1 12 6.1a4.4 4.4 0 0 1 8.4 2.6Z" />
    </svg>
  ),
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
  const visiblePages = primaryPages.filter((pageName) =>
    connectedPages.includes(pageName),
  );

  return (
    <>
      <header className="navigation-header">
        <Link to="/" className="nav-brand">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span className="brand-wordmark">FOOD FINDER<small>THE RECIPE EDITION</small></span>
        </Link>
      </header>

      <nav className="main-navigation" aria-label="Main navigation">
        <div className="nav-links">
          {visiblePages.map((pageName) => (
            <Link
              key={pageName}
              to={pagePaths[pageName]}
              className={pageName === currentPage ? "nav-link active" : "nav-link"}
              aria-current={pageName === currentPage ? "page" : undefined}
            >
              <span className="nav-icon">{pageIcons[pageName]}</span>
              <span className="nav-label">{pageLabels[pageName]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

export default Navigation;

import { Link, useLocation } from "react-router-dom";

const navigationPages = [
  { name: "Home", label: "ค้นหาเมนู", path: "/" },
  { name: "IngredientFinder", label: "ค้นหาจากวัตถุดิบ", path: "/ingredients" },
  { name: "Queue", label: "คิวเมนู", path: "/queue" },
  { name: "SavedRecipes", label: "เมนูที่บันทึก", path: "/saved" },
];

function Navigation() {
  const location = useLocation();

  return (
    <nav className="main-navigation">
      <Link to="/" className="nav-brand">
        🍽️ FoodFinder
      </Link>

      <div className="nav-links">
        {navigationPages.map((page) => {
          const isActive =
            page.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(page.path);

          return (
            <Link
              key={page.name}
              to={page.path}
              className={isActive ? "nav-link active" : "nav-link"}
            >
              {page.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default Navigation;

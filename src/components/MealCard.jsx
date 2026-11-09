import { Link } from "react-router-dom";

function MealCard({ meal, order, actionLabel, onAction, actions = [] }) {
  const cardActions =
    actions.length > 0
      ? actions
      : onAction
        ? [{ label: actionLabel, onAction }]
        : [];

  return (
    <article className="meal-card">
      {order !== undefined && <p>ลำดับที่ {order}</p>}
      <img src={meal.strMealThumb} alt={meal.strMeal} />
      <h3>{meal.strMeal}</h3>
      {(meal.strCategory || meal.strArea) && (
        <p>
          {meal.strCategory || "ไม่ระบุหมวดหมู่"}
          {meal.strArea ? ` · ${meal.strArea}` : ""}
        </p>
      )}
      <Link to={`/meal/${meal.idMeal}`}>ดูรายละเอียด</Link>
      {cardActions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => action.onAction(meal)}
        >
          {action.label}
        </button>
      ))}
    </article>
  );
}

export default MealCard;

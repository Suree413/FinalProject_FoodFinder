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
      {order !== undefined && <span className="meal-order">No. {order}</span>}
      <Link className="meal-card-image" to={`/meal/${meal.idMeal}`} aria-label={`View ${meal.strMeal} recipe`}>
        <img src={meal.strMealThumb} alt={meal.strMeal} loading="lazy" />
      </Link>
      <div className="meal-card-content">
        <div>
          <h3>{meal.strMeal}</h3>
          {(meal.strCategory || meal.strArea) && (
            <p className="meal-card-meta">
              {meal.strCategory || "Uncategorized"}
              {meal.strArea ? ` · ${meal.strArea}` : ""}
            </p>
          )}
        </div>
        <div className="meal-card-actions">
          <Link className="meal-card-link" to={`/meal/${meal.idMeal}`}>View recipe <span aria-hidden="true">↗</span></Link>
          {cardActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => action.onAction(meal)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export default MealCard;

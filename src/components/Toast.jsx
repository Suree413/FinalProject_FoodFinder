import { Link } from "react-router-dom";

function Toast({ variant, message, mealName, onDismiss }) {
  const isSuccess = variant === "success";

  return (
    <div
      className={`toast-notification toast-${variant}`}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      <span className="toast-icon" aria-hidden="true">
        {isSuccess ? "✓" : variant === "warning" ? "!" : "×"}
      </span>
      <div className="toast-copy">
        <strong>{isSuccess ? "Added to your Queue!" : message}</strong>
        {mealName && <span>{mealName}</span>}
      </div>
      {isSuccess && (
        <Link to="/queue" className="toast-link">
          View Queue
        </Link>
      )}
    </div>
  );
}

export default Toast;

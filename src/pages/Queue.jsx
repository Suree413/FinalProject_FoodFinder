import { useState } from "react";
import { Link } from "react-router-dom";
import MealCard from "../components/MealCard";
import { MealQueue } from "../utils/MealQueue";
import {
  QUEUE_STORAGE_KEY,
  readStoredMeals,
  writeStoredMeals,
} from "../utils/mealStorage";

function Queue() {
  const [queue, setQueue] = useState(
    () => new MealQueue(readStoredMeals(QUEUE_STORAGE_KEY)).getQueue(),
  );
  const [peekedMeal, setPeekedMeal] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateQueue = (operation) => {
    const mealQueue = new MealQueue(queue);
    const result = operation(mealQueue);
    const updatedQueue = mealQueue.getQueue();

    try {
      writeStoredMeals(QUEUE_STORAGE_KEY, updatedQueue);
      setQueue(updatedQueue);
      setError("");
      return result;
    } catch (storageError) {
      setError(storageError.message || "Couldn't update your queue.");
      return null;
    }
  };

  const peekNextMeal = () => {
    const nextMeal = new MealQueue(queue).peek();
    setPeekedMeal(nextMeal);
    setMessage(
      nextMeal
        ? `Next up: ${nextMeal.strMeal}`
        : "Your queue is empty. Add a meal to get started!",
    );
  };

  const dequeueNextMeal = () => {
    const removedMeal = updateQueue((mealQueue) => mealQueue.dequeue());
    setPeekedMeal(null);
    setMessage(
      removedMeal
        ? `Removed ${removedMeal.strMeal} from the top of your queue.`
        : "Your queue is empty. Nothing to remove.",
    );
  };

  const removeFromQueue = (id) => {
    const removed = updateQueue((mealQueue) => mealQueue.remove(id));
    if (removed) setMessage("Removed from your queue.");
  };

  const clearQueue = () => {
    try {
      writeStoredMeals(QUEUE_STORAGE_KEY, []);
      setQueue([]);
      setPeekedMeal(null);
      setMessage("Your queue is cleared.");
      setError("");
    } catch (storageError) {
      setError(storageError.message || "Couldn't clear your queue.");
    }
  };

  return (
    <div className="queue-page">
      <div className="queue-heading">
        <div>
          <p className="eyebrow">Collected for later</p>
          <h1>Your Food Collection</h1>
          <p>Your recipes, thoughtfully gathered in the order you added them.</p>
        </div>
        <span className="queue-count"><strong>{queue.length}</strong> {queue.length === 1 ? "recipe" : "recipes"}</span>
      </div>

      <div className="queue-actions">
        <button type="button" onClick={peekNextMeal}>
          Next Up
        </button>
        <button
          type="button"
          onClick={dequeueNextMeal}
          disabled={queue.length === 0}
        >
          Remove Next
        </button>
        <button
          type="button"
          onClick={clearQueue}
          disabled={queue.length === 0}
        >
          Clear queue
        </button>
      </div>

      {error && <p className="status-message error-message">{error}</p>}
      {message && !error && (
        <p className="status-message" role="status">{message}</p>
      )}
      {peekedMeal && (
        <p className="peeked-meal">
          Next at the table:{" "}
          <Link to={`/meal/${peekedMeal.idMeal}`}>{peekedMeal.strMeal}</Link>
        </p>
      )}

      {queue.length === 0 ? (
        <div className="empty-collection">
          <span aria-hidden="true">✳</span>
          <h2>A collection in the making</h2>
          <p>Save a recipe to your queue and it will be waiting here for you.</p>
          <Link to="/">Explore recipes</Link>
        </div>
      ) : (
        <div className="meal-grid">
          {queue.map((meal, index) => (
            <MealCard
              key={meal.idMeal}
              meal={meal}
              order={index + 1}
              actionLabel="Remove from queue"
              onAction={(item) => removeFromQueue(item.idMeal)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Queue;

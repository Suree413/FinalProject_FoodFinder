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
      <h1>📋 My Food Queue</h1>
      <p>Your meals, in the order you added them (FIFO).</p>

      <div className="queue-actions">
        <button type="button" onClick={peekNextMeal}>
          Next up
        </button>
        <button
          type="button"
          onClick={dequeueNextMeal}
          disabled={queue.length === 0}
        >
          Remove first
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
          Up next:{" "}
          <Link to={`/meal/${peekedMeal.idMeal}`}>{peekedMeal.strMeal}</Link>
        </p>
      )}

      {queue.length === 0 ? (
        <p>Your queue is empty. Add a meal you love!</p>
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

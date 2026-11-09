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
      setError(storageError.message || "บันทึก Queue ไม่สำเร็จ");
      return null;
    }
  };

  const peekNextMeal = () => {
    const nextMeal = new MealQueue(queue).peek();
    setPeekedMeal(nextMeal);
    setMessage(
      nextMeal
        ? `เมนูถัดไปคือ ${nextMeal.strMeal}`
        : "Queue ว่าง ไม่มีเมนูให้ Peek",
    );
  };

  const dequeueNextMeal = () => {
    const removedMeal = updateQueue((mealQueue) => mealQueue.dequeue());
    setPeekedMeal(null);
    setMessage(
      removedMeal
        ? `นำ ${removedMeal.strMeal} ออกจากหัวคิวแล้ว`
        : "Queue ว่าง ไม่มีเมนูให้ Dequeue",
    );
  };

  const removeFromQueue = (id) => {
    const removed = updateQueue((mealQueue) => mealQueue.remove(id));
    if (removed) setMessage("นำเมนูออกจาก Queue แล้ว");
  };

  const clearQueue = () => {
    try {
      writeStoredMeals(QUEUE_STORAGE_KEY, []);
      setQueue([]);
      setPeekedMeal(null);
      setMessage("ล้าง Queue แล้ว");
      setError("");
    } catch (storageError) {
      setError(storageError.message || "ล้าง Queue ไม่สำเร็จ");
    }
  };

  return (
    <div className="queue-page">
      <h1>📋 My Food Queue</h1>
      <p>รายการเมนูอาหารตามลำดับที่เพิ่ม (FIFO)</p>

      <div className="queue-actions">
        <button type="button" onClick={peekNextMeal}>
          Peek เมนูถัดไป
        </button>
        <button
          type="button"
          onClick={dequeueNextMeal}
          disabled={queue.length === 0}
        >
          Dequeue เมนูแรก
        </button>
        <button
          type="button"
          onClick={clearQueue}
          disabled={queue.length === 0}
        >
          ล้าง Queue ทั้งหมด
        </button>
      </div>

      {error && <p className="status-message error-message">{error}</p>}
      {message && !error && (
        <p className="status-message" role="status">{message}</p>
      )}
      {peekedMeal && (
        <p className="peeked-meal">
          หัวคิว:{" "}
          <Link to={`/meal/${peekedMeal.idMeal}`}>{peekedMeal.strMeal}</Link>
        </p>
      )}

      {queue.length === 0 ? (
        <p>ยังไม่มีเมนูใน Queue</p>
      ) : (
        <div className="meal-grid">
          {queue.map((meal, index) => (
            <MealCard
              key={meal.idMeal}
              meal={meal}
              order={index + 1}
              actionLabel="นำออกจาก Queue"
              onAction={(item) => removeFromQueue(item.idMeal)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Queue;

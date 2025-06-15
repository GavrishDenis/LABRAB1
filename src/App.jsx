import React, { useState, useEffect } from "react";
import "./App.css";
import ToDoForm from "./AddTask";
import ToDo from "./Task";
import axios from 'axios';

const TASKS_STORAGE_KEY = "tasks-list-project-web";

function App() {
  const [dogImage, setDogImage] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch random dog image
      const dogResponse = await axios.get("https://dog.ceo/api/breeds/image/random", {
        timeout: 10000
      });
      if (dogResponse.data.status !== "success") {
        throw new Error("Failed to load dog image");
      }
      setDogImage(dogResponse.data.message);
      
      // Fetch random activity
      const activityResponse = await axios.get("https://bored-api.appbrewery.com/random", {
        timeout: 10000
      });
      if (!activityResponse.data.activity) {
        throw new Error("Failed to load activity");
      }
      setActivity(activityResponse.data);
      
    } catch (err) {
      setError(err.message || "Network error. Please check your connection.");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTask = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      ...prev,
      {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        task: trimmed,
        complete: false,
      },
    ]);
  };

  const removeTask = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));

  const toggleTask = (id) =>
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, complete: !t.complete } : t
      )
    );

  return (
    <div className="app-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      )}

      <div className="app-header">
        <h1 className="app-title">My Tasks</h1>
        <div className="task-counter">{todos.length}</div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
          <button 
            onClick={fetchData} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="info-panel">
          <div className="dog-panel">
            <h3>Random Dog</h3>
            {dogImage && (
              <img 
                src={dogImage} 
                alt="Random dog" 
                className="dog-image"
              />
            )}
          </div>

          <div className="activity-panel">
            <h3>Random Activity</h3>
            {activity && (
              <>
                <p><strong>{activity.activity}</strong></p>
                <p>Type: {activity.type}</p>
                <p>Participants: {activity.participants}</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="todo-container">
        <ToDoForm addTask={addTask} />

        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="empty-state">
              <p>You have no tasks</p>
              <p>Add your first task above</p>
            </div>
          ) : (
            todos.map((todo) => (
              <ToDo
                todo={todo}
                key={todo.id}
                toggleTask={toggleTask}
                removeTask={removeTask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

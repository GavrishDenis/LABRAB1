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

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch random dog image
        const dogResponse = await axios.get("https://dog.ceo/api/breeds/image/random");
        setDogImage(dogResponse.data.message);
        
        // Fetch random activity
        const activityResponse = await axios.get("https://bored-api.appbrewery.com/random");
        setActivity(activityResponse.data);
        
        setError("");
      } catch (err) {
        setError(err.message || "Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }
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
          <p>Загрузка данных...</p>
        </div>
      )}

      <div className="app-header">
        <h1 className="app-title">Мои задачи</h1>
        <div className="task-counter">{todos.length}</div>
      </div>

      {!loading && error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="info-panel">
          {dogImage && (
            <div className="dog-panel">
              <img 
                src={dogImage} 
                alt="Random dog" 
                className="dog-image"
                style={{ maxWidth: '100%', borderRadius: '8px' }}
              />
            </div>
          )}

          {activity && (
            <div className="activity-panel">
              <h3>Random Activity</h3>
              <p><strong>Type:</strong> {activity.type}</p>
              <p><strong>Activity:</strong> {activity.activity}</p>
              <p><strong>Participants:</strong> {activity.participants}</p>
            </div>
          )}
        </div>
      )}

      <div className="todo-container">
        <ToDoForm addTask={addTask} />

        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="empty-state">
              <p>У вас нет задач</p>
              <p>Добавьте первую задачу выше</p>
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

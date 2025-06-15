import React, { useState, useEffect } from "react";
import "./App.css";
import ToDoForm from "./AddTask";
import ToDo from "./Task";

const TASKS_STORAGE_KEY = "tasks-list-project-web";

function App() {
  const [dogImage, setDogImage] = useState("");
  const [activity, setActivity] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Простая версия запроса к Dog API
        const dogResponse = await fetch("https://dog.ceo/api/breeds/image/random");
        if (!dogResponse.ok) throw new Error("Dog API error");
        const dogData = await dogResponse.json();
        setDogImage(dogData.message || "https://images.dog.ceo/breeds/maltese/n02085936_1003.jpg");
        
        // Простая версия запроса к Bored API
        const activityResponse = await fetch("https://www.boredapi.com/api/activity");
        if (!activityResponse.ok) throw new Error("Activity API error");
        const activityData = await activityResponse.json();
        setActivity(activityData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data. Showing default information.");
        setDogImage("https://images.dog.ceo/breeds/maltese/n02085936_1003.jpg");
        setActivity({
          activity: "Read a book",
          type: "education",
          participants: 1
        });
      } finally {
        setLoading(false);
      }
    };

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
        id: Date.now().toString(),
        task: trimmed,
        complete: false,
      },
    ]);
  };

  const removeTask = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTask = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, complete: !t.complete } : t))
    );
  };

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
        </div>
      )}

      <div className="info-panel">
        <div className="dog-panel">
          <h3>Random Dog</h3>
          {dogImage && (
            <img 
              src={dogImage} 
              alt="Random dog" 
              className="dog-image"
              onError={(e) => {
                e.target.src = "https://images.dog.ceo/breeds/maltese/n02085936_1003.jpg";
              }}
            />
          )}
        </div>

        <div className="activity-panel">
          <h3>Random Activity</h3>
          <p><strong>{activity.activity || "Loading..."}</strong></p>
          <p>Type: {activity.type || "-"}</p>
          <p>Participants: {activity.participants || "-"}</p>
        </div>
      </div>

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
                key={todo.id}
                todo={todo}
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

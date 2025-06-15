import React, { useState, useEffect } from "react";
import "./App.css";
import ToDoForm from "./AddTask";
import ToDo from "./Task";
import axios from 'axios';

const TASKS_STORAGE_KEY = "tasks-list-project-web";
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

function App() {
  const [dogImage, setDogImage] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const fetchWithFallback = async (url, options = {}) => {
    try {
      const response = await axios({
        method: options.method || 'get',
        url: `${CORS_PROXY}${url}`,
        timeout: 10000,
        ...options
      });
      return response.data;
    } catch (err) {
      console.warn(`Failed through proxy, trying direct: ${err.message}`);
      try {
        const directResponse = await axios({
          method: options.method || 'get',
          url,
          timeout: 10000,
          ...options
        });
        return directResponse.data;
      } catch (directErr) {
        throw new Error(`Both proxy and direct failed: ${directErr.message}`);
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch random dog image with fallback
      const dogData = await fetchWithFallback("https://dog.ceo/api/breeds/image/random");
      if (dogData.status !== "success") {
        throw new Error("Dog API returned unsuccessful status");
      }
      setDogImage(dogData.message);
      
      // Fetch random activity with fallback
      const activityData = await fetchWithFallback("https://www.boredapi.com/api/activity");
      if (!activityData.activity) {
        throw new Error("Activity API returned no activity");
      }
      setActivity(activityData);

    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Network error. Please check your connection.");
      
      // Set fallback data if API fails
      if (!dogImage) {
        setDogImage("https://images.dog.ceo/breeds/labrador/n02099712_7418.jpg");
      }
      if (!activity) {
        setActivity({
          activity: "Read a book",
          type: "education",
          participants: 1
        });
      }
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

  // ... (остальные функции addTask, removeTask, toggleTask остаются без изменений)

  return (
    <div className="app-container">
      {/* ... (остальной JSX остается таким же) */}
    </div>
  );
}

export default App;

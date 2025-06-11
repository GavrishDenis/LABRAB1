import React, { useState, useEffect } from "react";
import "./App.css";
import ToDoForm from "./AddTask";
import ToDo from "./Task";
import axios from 'axios';

const TASKS_STORAGE_KEY = "tasks-list-project-web";
const WEATHER_API_KEY = "c7616da4b68205c2f3ae73df2c31d177";

function App() {
  const [rates, setRates] = useState({});
  const [weather, setWeather] = useState(null);
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
        const { data } = await axios.get(
          "https://www.cbr-xml-daily.ru/daily_json.js"
        );
        if (!data || !data.Valute)
          throw new Error("Валютные данные не найдены");
        setRates({
          USD: data.Valute.USD.Value.toFixed(2).replace(".", ","),
          EUR: data.Valute.EUR.Value.toFixed(2).replace(".", ","),
        });

        const getPosition = () =>
          new Promise((resolve, reject) => {
            if (!navigator.geolocation) reject(new Error("Нет геолокации"));
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

        const pos = await getPosition();
        const { latitude, longitude } = pos.coords;

        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`
        );
        if (!res.data || !res.data.main) throw new Error("Погода не найдена");
        setWeather(res.data);
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
          <div className="currency-panel">
            <div className="currency-item">
              <span className="currency-flag usd">$</span>
              <span className="currency-value">{rates.USD} ₽</span>
            </div>
            <div className="currency-item">
              <span className="currency-flag eur">€</span>
              <span className="currency-value">{rates.EUR} ₽</span>
            </div>
          </div>

          {weather && (
            <div className="weather-panel">
              <div className="weather-icon">
                <img
                  src={`https://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
                  alt={weather.weather[0].description}
                />
              </div>
              <div className="weather-details">
                <div className="weather-temp">{weather.main.temp.toFixed(1)}°C</div>
                <div className="weather-meta">
                  <span title="Скорость ветра">💨 {weather.wind.speed} м/с</span>
                  <span title="Облачность">☁️ {weather.clouds.all}%</span>
                </div>
              </div>
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

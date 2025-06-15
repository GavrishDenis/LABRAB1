import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [idea, setIdea] = useState("Загрузка...");
  const [catUrl, setCatUrl] = useState("");

  const fetchIdea = async () => {
    try {
      const response = await fetch("https://www.boredapi.com/api/activity");
      if (!response.ok) {
        throw new Error("API недоступен");
      }
      const data = await response.json();
      setIdea(data.activity);
    } catch (error) {
      setIdea("Скучно? Но котик всегда поднимет настроение 🐱");
    }
  };

  const fetchCat = () => {
    // Генерация случайного изображения с Unsplash
    const url = `https://source.unsplash.com/300x300/?cat&sig=${Math.floor(
      Math.random() * 1000
    )}`;
    setCatUrl(url);
  };

  const handleNewIdea = () => {
    fetchIdea();
    fetchCat();
  };

  useEffect(() => {
    handleNewIdea(); // загрузить идею и кота при старте
  }, []);

  return (
    <div className="app">
      <h1>Чем заняться?</h1>
      <p className="idea">{idea}</p>
      <img className="cat" src={catUrl} alt="Котик" />
      <button className="btn" onClick={handleNewIdea}>
        Получить новую идею 🧠
      </button>
    </div>
  );
}

export default App;

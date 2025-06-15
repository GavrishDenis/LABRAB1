import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [idea, setIdea] = useState("Загрузка...");

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await fetch("https://bored-api.appbrewery.com/random");
        if (!response.ok) {
          throw new Error("API недоступен");
        }
        const data = await response.json();
        setIdea(data.activity);
      } catch (error) {
        setIdea("Скучно? Используй VPN или просто полюбуйся котиком 🐱");
      }
    };

    fetchIdea();
  }, []);

  return (
    <div className="app">
      <h1>Чем заняться?</h1>
      <p className="idea">{idea}</p>
      <img
        className="cat"
        src="https://placekitten.com/300/300"
        alt="Котик"
      />
    </div>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [quote, setQuote] = useState("Загрузка...");
  const [catUrl, setCatUrl] = useState("");
  const [mode, setMode] = useState("cat"); // "cat" или "anime"

  const fetchQuote = async () => {
    try {
      let response, data;
      if (mode === "cat") {
        response = await fetch("https://catfact.ninja/fact");
        data = await response.json();
        setQuote(data.fact);
      } else {
        response = await fetch("https://animechan.xyz/api/random");
        data = await response.json();
        setQuote(`"${data.quote}" — ${data.character} (${data.anime})`);
      }
    } catch (error) {
      setQuote("Что-то пошло не так. Проверь подключение.");
    }
  };

  const fetchCat = () => {
    const url = `https://source.unsplash.com/300x300/?cat&sig=${Math.floor(Math.random() * 1000)}`;
    setCatUrl(url);
  };

  const handleClick = () => {
    fetchQuote();
    fetchCat();
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
  };

  useEffect(() => {
    handleClick();
  }, [mode]);

  return (
    <div className="app">
      <h1>{mode === "cat" ? "Факт о кошках" : "Цитата из аниме"}</h1>
      <div className="controls">
        <select onChange={handleModeChange} value={mode}>
          <option value="cat">Факт о кошках</option>
          <option value="anime">Цитата из аниме</option>
        </select>
        <button className="btn" onClick={handleClick}>
          Получить новую
        </button>
      </div>
      <p className="quote">{quote}</p>
      <img className="cat" src={catUrl} alt="Котик" />
    </div>
  );
}

export default App;

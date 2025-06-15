import React, { useState, useEffect } from "react";
import "./App.css";
import ToDoForm from "./AddTask";
import ToDo from "./Task";

function App() {
  const [catUrl, setCatUrl] = useState("https://placekitten.com/300/200");
  const [btcPrice, setBtcPrice] = useState(null);
  const [todos, setTodos] = useState([]);

  // Получение курса BTC
  const fetchBTC = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub"
      );
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      setBtcPrice(data.bitcoin.rub);
    } catch (error) {
      console.error("Ошибка при загрузке курса BTC:", error);
      setBtcPrice(null);
    }
  };

  // Обновление котика с рандомными размерами
  const getNewCat = () => {
    const width = 300 + Math.floor(Math.random() * 100);
    const height = 200 + Math.floor(Math.random() * 100);
    setCatUrl(`https://placekitten.com/${width}/${height}`);
  };

  useEffect(() => {
    fetchBTC();
  }, []);

  const addTask = (userInput) => {
    if (!userInput.trim()) return; // игнорируем пустые
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      task: userInput.trim(),
      complete: false,
    };
    setTodos((prev) => [...prev, newItem]);
  };

  const removeTask = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleToggle = (id) => {
    setTodos((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, complete: !task.complete } : task
      )
    );
  };

  return (
    <div className="App">
      <h1>🐱 Кот и курс Bitcoin</h1>

      <div className="block">
        <h2>Кот дня</h2>
        <img src={catUrl} alt="Котик" className="cat-img" />
        <button onClick={getNewCat}>Показать нового кота</button>
      </div>

      <div className="block">
        <h2>Курс BTC (₽)</h2>
        {btcPrice !== null ? (
          <p>1 BTC = {btcPrice.toLocaleString()} ₽</p>
        ) : (
          <p>Не удалось загрузить курс</p>
        )}
        <button onClick={fetchBTC}>Обновить курс</button>
      </div>

      <div className="block">
        <header>
          <h2>📝 Список задач: {todos.length}</h2>
        </header>
        <ToDoForm addTask={addTask} />
        {todos.map((todo) => (
          <ToDo
            todo={todo}
            key={todo.id}
            toggleTask={handleToggle}
            removeTask={removeTask}
          />
        ))}
      </div>
    </div>
  );
}

export default App;


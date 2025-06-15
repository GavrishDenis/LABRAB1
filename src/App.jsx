import React, { useEffect, useState } from "react";
import ToDoForm from "./AddTask";
import ToDo from "./Task";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [catFact, setCatFact] = useState("");

  // Загрузка цены Bitcoin с CoinCap API
  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch("https://api.coincap.io/v2/assets/bitcoin");
      const json = await response.json();
      if (json.data && json.data.priceUsd) {
        setBitcoinPrice(parseFloat(json.data.priceUsd).toFixed(2));
      } else {
        setBitcoinPrice("Ошибка получения цены");
      }
    } catch (error) {
      setBitcoinPrice("Ошибка подключения");
      console.error("Ошибка API Bitcoin:", error);
    }
  };

  // Загрузка факта о коте с meowfacts
  const fetchCatFact = async () => {
    try {
      const response = await fetch("https://meowfacts.herokuapp.com/");
      const json = await response.json();
      if (json.data && json.data.length > 0) {
        setCatFact(json.data[0]);
      } else {
        setCatFact("Нет данных");
      }
    } catch (error) {
      setCatFact("Ошибка подключения");
      console.error("Ошибка API котов:", error);
    }
  };

  useEffect(() => {
    fetchBitcoinPrice();
    fetchCatFact();
  }, []);

  // Добавление задачи
  const addTask = (userInput) => {
    if (userInput) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        task: userInput,
        complete: false,
      };
      setTodos([...todos, newItem]);
    }
  };

  // Удаление задачи
  const removeTask = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Переключение статуса задачи
  const handleToggle = (id) => {
    setTodos(
      todos.map((task) =>
        task.id === id ? { ...task, complete: !task.complete } : task
      )
    );
  };

  return (
    <div className="App">
      <header>
        <h1>Список задач: {todos.length}</h1>
      </header>

      <section className="info-section">
        <div className="cat-fact">
          <h2>Факт о коте:</h2>
          <p>{catFact || "Загрузка..."}</p>
          <button onClick={fetchCatFact}>Получить новый факт</button>
        </div>

        <div className="bitcoin-price">
          <h2>Цена Bitcoin (USD):</h2>
          <p>{bitcoinPrice !== null ? `$${bitcoinPrice}` : "Загрузка..."}</p>
          <button onClick={fetchBitcoinPrice}>Обновить цену</button>
        </div>
      </section>

      <ToDoForm addTask={addTask} />

      <div className="todo-list">
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

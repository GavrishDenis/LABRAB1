import React, { useState, useEffect } from "react";
import "./App.css";
import ToDoForm from "./AddTask";
import ToDo from "./Task";

function App() {
  const [catFact, setCatFact] = useState("");
  const [btcPrice, setBtcPrice] = useState("");
  const [todos, setTodos] = useState([]);

  // Загрузка факта о коте
  const fetchCatFact = async () => {
    try {
      const response = await fetch("https://catfact.ninja/fact");
      const json = await response.json();
      setCatFact(json.fact);
    } catch (error) {
      console.error("Ошибка загрузки факта о котике:", error);
    }
  };

  // Загрузка цены BTC в рублях
  const fetchBtcPrice = async () => {
    try {
      const response = await fetch(
        "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=RUB"
      );
      const json = await response.json();
      setBtcPrice(json.RUB);
    } catch (error) {
      console.error("Ошибка загрузки курса BTC:", error);
    }
  };

  useEffect(() => {
    fetchCatFact();
    fetchBtcPrice();
  }, []);

  // Добавление задачи
  const addTask = (userInput) => {
    if (userInput) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        task: userInput,
        complete: false,
        key: Date.now(),
      };
      setTodos([...todos, newItem]);
    }
  };

  // Удаление задачи
  const removeTask = (id) => {
    setTodos([...todos.filter((todo) => todo.id !== id)]);
  };

  // Переключение статуса задачи
  const handleToggle = (id) => {
    setTodos([
      ...todos.map((task) =>
        task.id === id ? { ...task, complete: !task.complete } : { ...task }
      ),
    ]);
  };

  return (
    <div className="App">
      <h1>🐾 Котофакт и курс BTC</h1>

      <div className="section">
        <h2>Факт о котике</h2>
        <p>{catFact}</p>
        <button onClick={fetchCatFact}>Получить новый факт</button>
      </div>

      <div className="section">
        <h2>Курс биткоина (BTC → RUB)</h2>
        <p>{btcPrice ? `${btcPrice} ₽` : "Загрузка..."}</p>
        <button onClick={fetchBtcPrice}>Обновить курс</button>
      </div>

      <div className="section">
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

import React, { useState, useEffect } from "react";
import ToDo from "./Task";
import ToDoForm from "./AddTask";
import "./App.css";

function App() {
  // Состояние для факта о коте
  const [catFact, setCatFact] = useState("");
  // Состояние для цены биткоина
  const [btcPrice, setBtcPrice] = useState(null);

  // Состояние для задач
  const [todos, setTodos] = useState([]);

  // Получить факт о коте
  const fetchCatFact = async () => {
    try {
      const res = await fetch("https://meowfacts.herokuapp.com/");
      const json = await res.json();
      setCatFact(json.data[0]);
    } catch (error) {
      console.error("Ошибка загрузки факта о коте:", error);
      setCatFact("Не удалось загрузить факт о коте");
    }
  };

  // Получить цену биткоина (в рублях) из CoinGecko
  const fetchBtcPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub"
      );
      const json = await res.json();
      setBtcPrice(json.bitcoin.rub);
    } catch (error) {
      console.error("Ошибка загрузки цены BTC:", error);
      setBtcPrice(null);
    }
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchCatFact();
    fetchBtcPrice();
  }, []);

  // Обработчики для задач

  const addTask = (userInput) => {
    if (userInput.trim() === "") return;
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      task: userInput,
      complete: false,
    };
    setTodos([...todos, newItem]);
  };

  const removeTask = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleTask = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, complete: !todo.complete } : todo
      )
    );
  };

  return (
    <div className="App">
      <header>
        <h1>React Приложение с котиками, Bitcoin и задачами</h1>
      </header>

      <section className="cat-section">
        <h2>Факт о котиках</h2>
        <p>{catFact}</p>
        <button onClick={fetchCatFact}>Получить новый факт</button>
      </section>

      <section className="btc-section">
        <h2>Цена Bitcoin (₽)</h2>
        {btcPrice !== null ? (
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {btcPrice.toLocaleString("ru-RU")} ₽
          </p>
        ) : (
          <p>Загрузка...</p>
        )}
        <button onClick={fetchBtcPrice}>Обновить цену</button>
      </section>

      <section className="todo-section">
        <h2>Список задач: {todos.length}</h2>
        <ToDoForm addTask={addTask} />
        <div className="todo-list">
          {todos.map((todo) => (
            <ToDo
              todo={todo}
              key={todo.id}
              toggleTask={toggleTask}
              removeTask={removeTask}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;


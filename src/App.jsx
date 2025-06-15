import React, { useState, useEffect } from "react";
import ToDo from "./Task";
import ToDoForm from "./AddTask";
import "./App.css";

function App() {
  // Инициализация состояний с чтением из localStorage
  const [catFact, setCatFact] = useState(() => {
    const saved = localStorage.getItem("catFact");
    return saved || "";
  });

  const [btcPrice, setBtcPrice] = useState(() => {
    const saved = localStorage.getItem("btcPrice");
    return saved ? parseFloat(saved) : null;
  });

  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });

  // Сохранение данных в localStorage при их изменении
  useEffect(() => {
    localStorage.setItem("catFact", catFact);
  }, [catFact]);

  useEffect(() => {
    if (btcPrice !== null) {
      localStorage.setItem("btcPrice", btcPrice.toString());
    }
  }, [btcPrice]);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

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

  // Получить цену биткоина
  const fetchBtcPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub"
      );
      const json = await res.json();
      setBtcPrice(json.bitcoin.rub);
    } catch (error) {
      console.error("Ошибка загрузки цены BTC:", error);
      // Пробуем альтернативный API если основной не работает
      try {
        const backupRes = await fetch(
          "https://api.binance.com/api/v3/ticker/price?symbol=BTCRUB"
        );
        const backupJson = await backupRes.json();
        setBtcPrice(parseFloat(backupJson.price));
      } catch (backupError) {
        console.error("Ошибка загрузки из резервного API:", backupError);
        setBtcPrice(null);
      }
    }
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    // Загружаем только если нет сохраненных данных
    if (!catFact) fetchCatFact();
    if (btcPrice === null) fetchBtcPrice();
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
        <p>{catFact || "Загрузка факта..."}</p>
        <button onClick={fetchCatFact}>Получить новый факт</button>
      </section>

      <section className="btc-section">
        <h2>Цена Bitcoin (₽)</h2>
        {btcPrice !== null ? (
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {btcPrice.toLocaleString("ru-RU")} ₽
          </p>
        ) : (
          <p>Не удалось загрузить цену</p>
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

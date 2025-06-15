import React, { useState, useEffect } from "react";
import ToDoForm from "./AddTask";
import ToDo from "./Task";

const App = () => {
  // Состояния
  const [catUrl, setCatUrl] = useState("https://placekitten.com/300/300");
  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [todos, setTodos] = useState([]);

  // Получение случайного котика (меняем размеры чтобы получить другой)
  const fetchCat = () => {
    const width = 300 + Math.floor(Math.random() * 100);
    const height = 300 + Math.floor(Math.random() * 100);
    setCatUrl(`https://placekitten.com/${width}/${height}`);
  };

  // Получение цены биткоина в рублях
  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub"
      );
      const data = await response.json();
      setBitcoinPrice(data.bitcoin.rub);
    } catch (error) {
      console.error("Ошибка при получении курса биткоина:", error);
      setBitcoinPrice(null);
    }
  };

  useEffect(() => {
    fetchCat();
    fetchBitcoinPrice();
  }, []);

  // Добавление задачи
  const addTask = (taskText) => {
    if (taskText.trim() === "") return;
    const newTask = {
      id: Date.now().toString(),
      task: taskText,
      complete: false,
    };
    setTodos((prev) => [...prev, newTask]);
  };

  // Удаление задачи
  const removeTask = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // Переключение статуса задачи
  const toggleTask = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, complete: !todo.complete } : todo
      )
    );
  };

  return (
    <div className="App">
      <h1>React-приложение с котиками, биткоином и задачами</h1>

      <section className="block">
        <h2>Случайный котик</h2>
        <img src={catUrl} alt="Random Cat" className="cat-img" />
        <button onClick={fetchCat}>Поменять котика</button>
      </section>

      <section className="block">
        <h2>Цена Bitcoin (RUB)</h2>
        {bitcoinPrice !== null ? (
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {bitcoinPrice.toLocaleString("ru-RU")} ₽
          </p>
        ) : (
          <p>Ошибка загрузки цены</p>
        )}
        <button onClick={fetchBitcoinPrice}>Обновить цену</button>
      </section>

      <section className="block">
        <h2>Список задач ({todos.length})</h2>
        <ToDoForm addTask={addTask} />
        {todos.length === 0 ? (
          <p>Пока нет задач</p>
        ) : (
          todos.map((todo) => (
            <ToDo
              key={todo.id}
              todo={todo}
              toggleTask={toggleTask}
              removeTask={removeTask}
            />
          ))
        )}
      </section>
    </div>
  );
};

export default App;

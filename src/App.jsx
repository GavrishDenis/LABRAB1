import React, { useState, useEffect } from "react";
import ToDoForm from "./AddTask";
import ToDo from "./Task";
import "./App.css";

function App() {
  const [mode, setMode] = useState("cat");
  const [data, setData] = useState("Загрузка...");
  const [imageUrl, setImageUrl] = useState("");

  const [todos, setTodos] = useState([]);

  const handleModeChange = (e) => setMode(e.target.value);

  // Добавить задачу
  const addTask = (userInput) => {
    if (userInput) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        key: Date.now().toString(),
        task: userInput,
        complete: false,
      };
      setTodos([...todos, newItem]);
    }
  };

  // Удалить задачу
  const removeTask = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Переключить статус задачи
  const handleToggle = (id) => {
    setTodos(
      todos.map((task) =>
        task.id === id ? { ...task, complete: !task.complete } : task
      )
    );
  };

  // Получить данные с API
  const fetchData = async () => {
    try {
      if (mode === "cat") {
        const response = await fetch("https://meowfacts.herokuapp.com/");
        const json = await response.json();
        setData(json.data[0]);
        setImageUrl(
          `https://source.unsplash.com/300x300/?cat&sig=${Math.floor(
            Math.random() * 1000
          )}`
        );
      } else {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub"
        );
        const json = await response.json();
        setData(`1 BTC = ${json.bitcoin.rub.toLocaleString("ru-RU")} ₽`);
        setImageUrl("https://cryptologos.cc/logos/bitcoin-btc-logo.png");
      }
    } catch (error) {
      setData("Ошибка при получении данных.");
      setImageUrl("");
    }
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

  return (
    <div className="app">
      <h1>{mode === "cat" ? "Факт о кошках" : "Курс Биткойна"}</h1>

      <div className="controls">
        <select onChange={handleModeChange} value={mode}>
          <option value="cat">Кошачий факт</option>
          <option value="bitcoin">Цена Биткойна</option>
        </select>
        <button className="btn" onClick={fetchData}>
          Обновить
        </button>
      </div>

      <div className="task">
        <p className="quote">{data}</p>
        {imageUrl && <img className="cat" src={imageUrl} alt="Изображение" />}
      </div>

      <header>
        <h1 className="list-header">Список задач: {todos.length}</h1>
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
  );
}

export default App;

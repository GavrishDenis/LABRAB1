import React, { useState } from "react";

const ToDoForm = ({ addTask }) => {
  const [input, setInput] = useState("");

  const handleChange = (e) => setInput(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    addTask(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        placeholder="Введите задачу..."
        value={input}
        onChange={handleChange}
      />
      <button type="submit">Добавить</button>
    </form>
  );
};

export default ToDoForm;

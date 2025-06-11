import React, { useState } from "react";

const ToDoForm = ({ addTask }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Добавить новую задачу..."
        className="todo-input"
      />
      <button type="submit" className="todo-button">
        Добавить
      </button>
    </form>
  );
};

export default ToDoForm;

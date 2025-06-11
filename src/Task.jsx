import React from "react";

const ToDo = ({ todo, toggleTask, removeTask }) => {
  return (
    <div className={`todo-item ${todo.complete ? "completed" : ""}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.complete}
          onChange={() => toggleTask(todo.id)}
          className="todo-checkbox"
        />
        <span className="todo-text">{todo.task}</span>
      </div>
      <button
        onClick={() => removeTask(todo.id)}
        className="todo-delete"
      >
        &times;
      </button>
    </div>
  );
};

export default ToDo;

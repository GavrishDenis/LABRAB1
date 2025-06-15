import React, { useState, useEffect } from 'react';
import './App.css';

const TASKS_STORAGE_KEY = "tasks-list-project-web-v2";

// Надежные fallback-данные
const DEFAULT_DATA = {
  dogImage: "https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg",
  activity: {
    activity: "Learn a new programming language",
    type: "education",
    participants: 1,
    key: "default-activity"
  }
};

// Утилита для надежного получения данных
const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
};

function App() {
  const [dogImage, setDogImage] = useState(DEFAULT_DATA.dogImage);
  const [activity, setActivity] = useState(DEFAULT_DATA.activity);
  const [loading, setLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadAppData = async () => {
    setLoading(true);
    setNetworkStatus('loading');
    
    try {
      // Параллельная загрузка данных
      const results = await Promise.allSettled([
        fetchData("https://dog.ceo/api/breeds/image/random"),
        fetchData("https://www.boredapi.com/api/activity")
      ]);

      // Обработка данных собаки
      if (results[0].status === 'fulfilled' && results[0].value.status === 'success') {
        setDogImage(results[0].value.message);
      } else {
        console.warn('Using default dog image');
      }

      // Обработка активности
      if (results[1].status === 'fulfilled' && results[1].value.activity) {
        setActivity(results[1].value);
      } else {
        console.warn('Using default activity');
      }

      setNetworkStatus('success');
    } catch (error) {
      console.error('App data loading error:', error);
      setNetworkStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
    
    // Проверка соединения и обновление данных
    const onlineHandler = () => {
      if (navigator.onLine && networkStatus === 'error') {
        loadAppData();
      }
    };

    window.addEventListener('online', onlineHandler);
    return () => window.removeEventListener('online', onlineHandler);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }, [todos]);

  const addTask = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    const newTask = {
      id: crypto.randomUUID(),
      task: trimmed,
      complete: false,
      createdAt: new Date().toISOString()
    };
    
    setTodos(prev => [...prev, newTask]);
  };

  const removeTask = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const toggleTask = (id) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, complete: !t.complete } : t
    ));
  };

  const handleRetry = () => {
    if (navigator.onLine) {
      loadAppData();
    } else {
      alert('You are offline. Please check your internet connection.');
    }
  };

  return (
    <div className="app-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading application data...</p>
        </div>
      )}

      <header className="app-header">
        <h1 className="app-title">My Task Manager</h1>
        <div className="header-info">
          <span className="task-counter">{todos.length} tasks</span>
          <span className={`network-status ${networkStatus}`}>
            {networkStatus === 'loading' ? '🔄' : 
             networkStatus === 'success' ? '✅' : '⚠️'}
          </span>
        </div>
      </header>

      {networkStatus === 'error' && (
        <div className="network-alert">
          <p>Content may not be up to date. Check your connection.</p>
          <button onClick={handleRetry} className="refresh-button">
            Refresh Data
          </button>
        </div>
      )}

      <section className="api-data-section">
        <article className="dog-card">
          <h2>Daily Dog</h2>
          <div className="image-wrapper">
            <img 
              src={dogImage} 
              alt="Random dog" 
              onError={(e) => {
                e.target.src = DEFAULT_DATA.dogImage;
                console.warn('Failed to load dog image, using fallback');
              }}
            />
          </div>
          <button 
            onClick={() => loadAppData()} 
            className="secondary-button"
          >
            New Dog
          </button>
        </article>

        <article className="activity-card">
          <h2>Suggested Activity</h2>
          <div className="activity-content">
            <h3>{activity.activity}</h3>
            <div className="activity-meta">
              <span>Type: {activity.type}</span>
              <span>People: {activity.participants}</span>
            </div>
          </div>
          <button 
            onClick={() => loadAppData()} 
            className="secondary-button"
          >
            New Activity
          </button>
        </article>
      </section>

      <section className="todo-section">
        <ToDoForm addTask={addTask} />
        
        <div className="todo-list-container">
          {todos.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet</p>
              <p>Add your first task above</p>
            </div>
          ) : (
            <ul className="todo-list">
              {todos.map(todo => (
                <ToDoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTask}
                  onRemove={removeTask}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

// Компонент формы
const ToDoForm = ({ addTask }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask(inputValue);
    setInputValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="What needs to be done?"
        className="todo-input"
        required
      />
      <button type="submit" className="primary-button">
        Add Task
      </button>
    </form>
  );
};

// Компонент элемента задачи
const ToDoItem = ({ todo, onToggle, onRemove }) => {
  return (
    <li className={`todo-item ${todo.complete ? 'completed' : ''}`}>
      <label className="todo-label">
        <input
          type="checkbox"
          checked={todo.complete}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
        />
        <span className="todo-text">{todo.task}</span>
      </label>
      <button 
        onClick={() => onRemove(todo.id)} 
        className="delete-button"
        aria-label="Delete task"
      >
        &times;
      </button>
    </li>
  );
};

export default App;

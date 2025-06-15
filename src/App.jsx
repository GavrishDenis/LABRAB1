import React, { useState, useEffect } from 'react';
import './App.css';

const TASKS_STORAGE_KEY = "tasks-ru-v1";

// Российские и международные API, работающие в РФ
const API_ENDPOINTS = {
  dog: 'https://randombig.cat/roar.json', // Альтернатива Dog API
  activity: 'https://www.boredapi.com/api/activity', // Работает в РФ
  quote: 'https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=ru' // Русские цитаты
};

// Локальные данные на случай недоступности API
const LOCAL_DATA = {
  dogs: [
    'https://krasivosti.pro/uploads/posts/2021-04/1617919698_15-p-sobaka-na-belom-fone-19.jpg',
    'https://proprirodu.ru/wp-content/uploads/2023/01/orig-21.jpg',
    'https://mykaleidoscope.ru/x/uploads/posts/2022-09/1663830516_51-mykaleidoscope-ru-p-veselaya-morda-sobaki-instagram-56.jpg'
  ],
  activities: [
    { activity: "Почитать книгу", type: "образование", participants: 1 },
    { activity: "Сходить на прогулку", type: "активный отдых", participants: 1 },
    { activity: "Приготовить новое блюдо", type: "кулинария", participants: 1 }
  ],
  quotes: [
    { quoteText: "Лучше поздно, чем никогда.", quoteAuthor: "Народная мудрость" },
    { quoteText: "Дело мастера боится.", quoteAuthor: "Пословица" }
  ]
};

function App() {
  const [dogImage, setDogImage] = useState(LOCAL_DATA.dogs[0]);
  const [activity, setActivity] = useState(LOCAL_DATA.activities[0]);
  const [quote, setQuote] = useState(LOCAL_DATA.quotes[0]);
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Универсальный метод загрузки данных
  const fetchData = async (type) => {
    try {
      const response = await fetch(API_ENDPOINTS[type], {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      
      switch(type) {
        case 'dog':
          return data.url || LOCAL_DATA.dogs[0];
        case 'activity':
          return data.activity ? data : LOCAL_DATA.activities[0];
        case 'quote':
          return data.quoteText ? data : LOCAL_DATA.quotes[0];
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      switch(type) {
        case 'dog': return LOCAL_DATA.dogs[Math.floor(Math.random() * LOCAL_DATA.dogs.length)];
        case 'activity': return LOCAL_DATA.activities[Math.floor(Math.random() * LOCAL_DATA.activities.length)];
        case 'quote': return LOCAL_DATA.quotes[Math.floor(Math.random() * LOCAL_DATA.quotes.length)];
        default: return null;
      }
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    
    // Параллельная загрузка всех данных
    const [dogData, activityData, quoteData] = await Promise.all([
      fetchData('dog'),
      fetchData('activity'),
      fetchData('quote')
    ]);
    
    setDogImage(dogData);
    setActivity(activityData);
    setQuote(quoteData);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // Функции для работы с задачами
  const addTask = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    setTodos(prev => [...prev, {
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
      date: new Date().toLocaleDateString('ru-RU')
    }]);
  };

  const toggleTask = (id) => {
    setTodos(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTodos(prev => prev.filter(task => task.id !== id));
  };

  return (
    <div className="app">
      {loading ? (
        <div className="loader">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      ) : (
        <>
          <header className="header">
            <h1>Менеджер задач</h1>
            <p className="quote">"{quote.quoteText}" <span>— {quote.quoteAuthor || 'Неизвестный автор'}</span></p>
          </header>

          <div className="content">
            <div className="api-cards">
              <div className="card">
                <h2>Случайная собака</h2>
                <img 
                  src={dogImage} 
                  alt="Случайная собака"
                  onError={(e) => {
                    e.target.src = LOCAL_DATA.dogs[0];
                  }}
                />
                <button onClick={() => fetchData('dog').then(setDogImage)}>
                  Обновить
                </button>
              </div>

              <div className="card">
                <h2>Случайное занятие</h2>
                <h3>{activity.activity}</h3>
                <p>Тип: {activity.type}</p>
                <p>Участники: {activity.participants}</p>
                <button onClick={() => fetchData('activity').then(setActivity)}>
                  Новое занятие
                </button>
              </div>
            </div>

            <div className="todo-section">
              <TaskForm onSubmit={addTask} />
              
              <div className="task-list">
                {todos.length === 0 ? (
                  <p className="empty">Нет задач. Добавьте первую!</p>
                ) : (
                  todos.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Компонент формы задачи
function TaskForm({ onSubmit }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Добавить новую задачу..."
        required
      />
      <button type="submit">Добавить</button>
    </form>
  );
}

// Компонент элемента задачи
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`task ${task.completed ? 'completed' : ''}`}>
      <label>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <span>{task.text}</span>
      </label>
      <span className="task-date">{task.date}</span>
      <button 
        onClick={() => onDelete(task.id)}
        className="delete-btn"
      >
        ×
      </button>
    </div>
  );
}

export default App;

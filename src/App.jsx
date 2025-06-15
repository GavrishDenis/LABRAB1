import React, { useState, useEffect } from 'react';
import './App.css';

const TASKS_STORAGE_KEY = "tasks-list-v3";
const DOG_API_URL = "https://api.thedogapi.com/v1/images/search";
const ACTIVITY_API_URL = "https://api.api-ninjas.com/v1/bored?type=recreational";

// Локальные fallback-данные
const LOCAL_DATA = {
  dogImages: [
    'https://cdn.pixabay.com/photo/2016/12/13/05/15/puppy-1903313_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/09/25/13/12/dog-2785074_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/02/19/15/46/dog-1210559_1280.jpg'
  ],
  activities: [
    { activity: "Read a programming book", type: "education", participants: 1 },
    { activity: "Go for a 30-minute walk", type: "recreational", participants: 1 },
    { activity: "Cook a new recipe", type: "cooking", participants: 1 }
  ]
};

function App() {
  const [dogImage, setDogImage] = useState(LOCAL_DATA.dogImages[0]);
  const [activity, setActivity] = useState(LOCAL_DATA.activities[0]);
  const [loading, setLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState('loading');
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Улучшенный fetch с обработкой ошибок
  const safeFetch = async (url, options) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(`Fetch failed for ${url}:`, error);
      throw error;
    }
  };

  const loadData = async () => {
    setLoading(true);
    setNetworkStatus('loading');
    
    try {
      // Параллельная загрузка данных с таймаутом
      const results = await Promise.allSettled([
        Promise.race([
          safeFetch(DOG_API_URL),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]),
        Promise.race([
          safeFetch(ACTIVITY_API_URL),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ])
      ]);

      // Обработка изображения собаки
      if (results[0].status === 'fulfilled') {
        setDogImage(results[0].value[0]?.url || getRandomLocalImage());
      } else {
        setDogImage(getRandomLocalImage());
      }

      // Обработка активности
      if (results[1].status === 'fulfilled') {
        setActivity(results[1].value || getRandomLocalActivity());
      } else {
        setActivity(getRandomLocalActivity());
      }

      setNetworkStatus('success');
    } catch (error) {
      console.error('Failed to load data:', error);
      setNetworkStatus('error');
      // Используем локальные данные при ошибке
      setDogImage(getRandomLocalImage());
      setActivity(getRandomLocalActivity());
    } finally {
      setLoading(false);
    }
  };

  const getRandomLocalImage = () => {
    return LOCAL_DATA.dogImages[Math.floor(Math.random() * LOCAL_DATA.dogImages.length)];
  };

  const getRandomLocalActivity = () => {
    return LOCAL_DATA.activities[Math.floor(Math.random() * LOCAL_DATA.activities.length)];
  };

  useEffect(() => {
    loadData();
    
    // Обновляем данные каждые 5 минут
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTask = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    const newTask = {
      id: Date.now().toString(),
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

  const handleRefresh = () => {
    if (navigator.onLine) {
      loadData();
    } else {
      alert('You are offline. Using local data.');
      setDogImage(getRandomLocalImage());
      setActivity(getRandomLocalActivity());
    }
  };

  return (
    <div className="app-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading application...</p>
        </div>
      )}

      <header className="app-header">
        <h1>My Task Manager</h1>
        <div className="status-indicator">
          <span className={`network-status ${networkStatus}`}>
            {networkStatus === 'loading' ? '🔄' : 
             networkStatus === 'success' ? '✅ Online' : '⚠️ Offline'}
          </span>
          <span className="task-count">{todos.length} tasks</span>
        </div>
      </header>

      <section className="content-section">
        <div className="api-cards">
          <div className="card dog-card">
            <h2>Daily Dog</h2>
            <div className="image-container">
              <img 
                src={dogImage} 
                alt="Random dog" 
                onError={(e) => {
                  e.target.src = getRandomLocalImage();
                  console.warn('Image failed to load, using fallback');
                }}
              />
            </div>
            <button onClick={handleRefresh} className="refresh-btn">
              New Image
            </button>
          </div>

          <div className="card activity-card">
            <h2>Suggested Activity</h2>
            <div className="activity-content">
              <h3>{activity.activity}</h3>
              <div className="activity-meta">
                <span>Type: {activity.type}</span>
                <span>Participants: {activity.participants}</span>
              </div>
            </div>
            <button onClick={handleRefresh} className="refresh-btn">
              New Activity
            </button>
          </div>
        </div>

        <div className="todo-section">
          <TaskForm onSubmit={addTask} />
          
          <div className="todo-list">
            {todos.length === 0 ? (
              <div className="empty-state">
                <p>No tasks yet</p>
                <p>Add your first task above</p>
              </div>
            ) : (
              todos.map(todo => (
                <TaskItem
                  key={todo.id}
                  task={todo}
                  onToggle={toggleTask}
                  onDelete={removeTask}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Компоненты вынесены для лучшей читаемости
const TaskForm = ({ onSubmit }) => {
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
        placeholder="What needs to be done?"
        required
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

const TaskItem = ({ task, onToggle, onDelete }) => {
  return (
    <div className={`task-item ${task.complete ? 'completed' : ''}`}>
      <label>
        <input
          type="checkbox"
          checked={task.complete}
          onChange={() => onToggle(task.id)}
        />
        <span>{task.task}</span>
      </label>
      <button 
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
      >
        &times;
      </button>
    </div>
  );
};

export default App;

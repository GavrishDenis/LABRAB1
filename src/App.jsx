import React, { useState, useEffect } from 'react';
import './App.css';

// Локальные резервные данные
const LOCAL_DATA = {
  shibes: [
    'https://cdn.shibe.online/shibes/1.jpg',
    'https://cdn.shibe.online/shibes/2.jpg',
    'https://cdn.shibe.online/shibes/3.jpg'
  ],
  activities: [
    { activity: "Почитать книгу", type: "образование", participants: 1 },
    { activity: "Сделать зарядку", type: "спорт", participants: 1 },
    { activity: "Приготовить новое блюдо", type: "кулинария", participants: 1 }
  ]
};

const App = () => {
  const [shibeImage, setShibeImage] = useState('');
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState({
    shibe: true,
    activity: true
  });
  const [error, setError] = useState({
    shibe: null,
    activity: null
  });

  // 1. Универсальный загрузчик с тремя уровнями резервирования
  const fetchData = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setError(prev => ({ ...prev, [type]: null }));

    try {
      // Попытка 1: Прямой запрос к API
      try {
        const apiUrls = {
          shibe: 'https://shibe.online/api/shibes?count=1',
          activity: 'https://www.boredapi.com/api/activity'
        };

        const response = await fetch(apiUrls[type]);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        
        const data = await response.json();
        const result = type === 'shibe' ? data[0] : data;
        
        if (result) {
          type === 'shibe' ? setShibeImage(result) : setActivity(result);
          return;
        }
      } catch (apiError) {
        console.warn(`Ошибка основного API (${type}):`, apiError);
        throw apiError;
      }

      // Попытка 2: Альтернативный источник
      try {
        const backupUrls = {
          shibe: 'https://shibe.online/api/shibes?count=1&https=true',
          activity: 'https://www.boredapi.com/api/activity?https=true'
        };

        const response = await fetch(backupUrls[type]);
        if (!response.ok) throw new Error(`Backup error ${response.status}`);
        
        const data = await response.json();
        const result = type === 'shibe' ? data[0] : data;
        
        if (result) {
          type === 'shibe' ? setShibeImage(result) : setActivity(result);
          return;
        }
      } catch (backupError) {
        console.warn(`Ошибка резервного API (${type}):`, backupError);
        throw backupError;
      }

      // Попытка 3: Локальные данные
      throw new Error('Все API недоступны, используем локальные данные');

    } catch (err) {
      setError(prev => ({ ...prev, [type]: err.message }));
      
      // Используем локальные данные
      if (type === 'shibe') {
        const randomImage = LOCAL_DATA.shibes[Math.floor(Math.random() * LOCAL_DATA.shibes.length)];
        setShibeImage(randomImage);
      } else {
        const randomActivity = LOCAL_DATA.activities[Math.floor(Math.random() * LOCAL_DATA.activities.length)];
        setActivity(randomActivity);
      }
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    fetchData('shibe');
    fetchData('activity');
  }, []);

  // 2. Обработчик ошибок изображений
  const handleImageError = (e) => {
    console.warn('Ошибка загрузки изображения, используем резервное');
    e.target.src = LOCAL_DATA.shibes[0];
  };

  return (
    <div className="app">
      <header>
        <h1>Галерея Сиба-Ину и Полезные Активности</h1>
        <p className="subtitle">Даже при проблемах с интернетом вы увидите контент</p>
      </header>

      <div className="content">
        <section className="shibe-section">
          <h2>Случайный Сиба-Ину</h2>
          
          {loading.shibe && <div className="loader">Загружаем собачку...</div>}
          
          {error.shibe && (
            <div className="error">
              <p>⚠️ {error.shibe}</p>
              <p>Показываем локальное изображение</p>
            </div>
          )}

          <div className="image-wrapper">
            <img 
              src={shibeImage} 
              alt="Случайный Сиба-Ину"
              onError={handleImageError}
            />
          </div>

          <button 
            onClick={() => fetchData('shibe')}
            disabled={loading.shibe}
          >
            {loading.shibe ? 'Загрузка...' : 'Новая собака'}
          </button>
        </section>

        <section className="activity-section">
          <h2>Случайная Активность</h2>
          
          {loading.activity && <div className="loader">Ищем занятие...</div>}
          
          {error.activity && (
            <div className="error">
              <p>⚠️ {error.activity}</p>
              <p>Показываем локальную активность</p>
            </div>
          )}

          {activity && (
            <div className="activity-card">
              <h3>{activity.activity}</h3>
              <p><strong>Тип:</strong> {activity.type}</p>
              <p><strong>Участники:</strong> {activity.participants}</p>
            </div>
          )}

          <button 
            onClick={() => fetchData('activity')}
            disabled={loading.activity}
          >
            {loading.activity ? 'Загрузка...' : 'Новое занятие'}
          </button>
        </section>
      </div>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';

// 1. Локальные резервные данные
const LOCAL_DATA = {
  shibes: [
    'https://cdn.shibe.online/shibes/1.jpg',
    'https://cdn.shibe.online/shibes/2.jpg',
    'https://cdn.shibe.online/shibes/3.jpg'
  ],
  activities: [
    { 
      activity: "Почитать книгу 'Мастер и Маргарита'", 
      type: "литература", 
      participants: 1 
    },
    { 
      activity: "Сделать комплекс утренней зарядки", 
      type: "спорт", 
      participants: 1 
    },
    { 
      activity: "Приготовить борщ по семейному рецепту", 
      type: "кулинария", 
      participants: 1 
    }
  ]
};

// 2. Альтернативные API-эндпоинты
const API_ENDPOINTS = {
  shibes: [
    'https://shibe.online/api/shibes?count=1',
    'https://shibe.online/api/shibes?count=1&https=true',
    'https://dog.ceo/api/breeds/image/random'
  ],
  activities: [
    'https://www.boredapi.com/api/activity',
    'https://www.boredapi.com/api/activity?lang=ru',
    'https://api.publicapis.org/entries?category=activity'
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

  // 3. Улучшенный fetch с таймаутом и повторными попытками
  const resilientFetch = async (url, options = {}, retries = 3) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return resilientFetch(url, options, retries - 1);
      }
      throw err;
    }
  };

  // 4. Загрузка данных с несколькими fallback-уровнями
  const fetchData = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setError(prev => ({ ...prev, [type]: null }));

    try {
      // Попытка 1: Основные API
      for (const endpoint of API_ENDPOINTS[type]) {
        try {
          const data = await resilientFetch(endpoint);
          const result = type === 'shibes' ? data[0] : data;
          if (result) {
            type === 'shibes' ? setShibeImage(result) : setActivity(result);
            return;
          }
        } catch (apiError) {
          console.warn(`Ошибка API (${endpoint}):`, apiError);
          continue;
        }
      }

      // Попытка 2: Локальные данные
      throw new Error('Все API недоступны');

    } catch (err) {
      setError(prev => ({ ...prev, [type]: err.message }));
      
      // Используем локальные данные
      const randomIndex = Math.floor(Math.random() * LOCAL_DATA[type].length);
      const fallbackData = LOCAL_DATA[type][randomIndex];
      
      type === 'shibes' 
        ? setShibeImage(fallbackData)
        : setActivity(fallbackData);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // 5. Обработчик ошибок изображений
  const handleImageError = (e) => {
    console.warn('Ошибка загрузки изображения');
    const fallbackImage = LOCAL_DATA.shibes[0];
    if (e.target.src !== fallbackImage) {
      e.target.src = fallbackImage;
    }
  };

  useEffect(() => {
    fetchData('shibes');
    fetchData('activities');
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Галерея Сиба-Ину и Полезные Активности</h1>
        <p className="subtitle">Работает даже при проблемах с интернетом</p>
      </header>

      <div className="content">
        <section className="shibe-section">
          <h2>Случайный Сиба-Ину</h2>
          
          {loading.shibe && (
            <div className="loader">
              <div className="spinner"></div>
              <p>Загружаем милашку...</p>
            </div>
          )}
          
          {error.shibe && (
            <div className="error">
              <p>⚠️ Не удалось загрузить новые фото</p>
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
            onClick={() => fetchData('shibes')}
            disabled={loading.shibe}
          >
            {loading.shibe ? 'Загрузка...' : 'Новая собака'}
          </button>
        </section>

        <section className="activity-section">
          <h2>Случайная Активность</h2>
          
          {loading.activity && (
            <div className="loader">
              <div className="spinner"></div>
              <p>Ищем интересное занятие...</p>
            </div>
          )}
          
          {error.activity && (
            <div className="error">
              <p>⚠️ Не удалось загрузить активность</p>
              <p>Показываем локальный вариант</p>
            </div>
          )}

          {activity && (
            <div className="activity-card">
              <h3>{activity.activity}</h3>
              <div className="activity-details">
                <p><span>Тип:</span> {activity.type}</p>
                <p><span>Участники:</span> {activity.participants}</p>
              </div>
            </div>
          )}

          <button 
            onClick={() => fetchData('activities')}
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

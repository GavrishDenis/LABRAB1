import React, { useState, useEffect } from 'react';
import './App.css';

// Российский прокси-сервер для обхода CORS
const RUSSIAN_PROXY = 'https://cors-anywhere.herokuapp.com/';

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

  // 1. Загрузка изображения через прокси
  const fetchShibe = async () => {
    try {
      setLoading(prev => ({ ...prev, shibe: true }));
      setError(prev => ({ ...prev, shibe: null }));
      
      const response = await fetch(`${RUSSIAN_PROXY}https://shibe.online/api/shibes?count=1`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) throw new Error('Ошибка загрузки изображения');
      
      const data = await response.json();
      setShibeImage(data[0]);
    } catch (err) {
      setError(prev => ({ ...prev, shibe: err.message }));
      setShibeImage('https://cdn.shibe.online/shibes/1.jpg');
    } finally {
      setLoading(prev => ({ ...prev, shibe: false }));
    }
  };

  // 2. Загрузка активности через прокси
  const fetchActivity = async () => {
    try {
      setLoading(prev => ({ ...prev, activity: true }));
      setError(prev => ({ ...prev, activity: null }));
      
      const response = await fetch(`${RUSSIAN_PROXY}https://www.boredapi.com/api/activity`);
      
      if (!response.ok) throw new Error('Ошибка загрузки активности');
      
      const data = await response.json();
      setActivity(data);
    } catch (err) {
      setError(prev => ({ ...prev, activity: err.message }));
      setActivity({
        activity: "Почитать книгу",
        type: "education",
        participants: 1
      });
    } finally {
      setLoading(prev => ({ ...prev, activity: false }));
    }
  };

  useEffect(() => {
    fetchShibe();
    fetchActivity();
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Галерея Сиба-Ину и Полезные Активности</h1>
      </header>

      <div className="content">
        <section className="shibe-section">
          <h2>Случайный Сиба-Ину</h2>
          {loading.shibe ? (
            <div className="loader">Загружаем милашку...</div>
          ) : (
            <>
              {error.shibe && <div className="error">{error.shibe}</div>}
              <div className="image-wrapper">
                <img 
                  src={shibeImage} 
                  alt="Случайный Сиба-Ину"
                  onError={(e) => {
                    e.target.src = 'https://cdn.shibe.online/shibes/1.jpg';
                  }}
                />
              </div>
              <button onClick={fetchShibe}>
                {loading.shibe ? 'Загрузка...' : 'Новая собака'}
              </button>
            </>
          )}
        </section>

        <section className="activity-section">
          <h2>Случайная Активность</h2>
          {loading.activity ? (
            <div className="loader">Ищем занятие...</div>
          ) : (
            <>
              {error.activity && <div className="error">{error.activity}</div>}
              <div className="activity-card">
                <h3>{activity?.activity}</h3>
                <p><strong>Тип:</strong> {activity?.type}</p>
                <p><strong>Участники:</strong> {activity?.participants}</p>
              </div>
              <button onClick={fetchActivity}>
                {loading.activity ? 'Загрузка...' : 'Новое занятие'}
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;

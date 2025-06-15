import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [shibeImage, setShibeImage] = useState('');
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState({
    shibe: false,
    activity: false
  });
  const [error, setError] = useState({
    shibe: null,
    activity: null
  });

  // Refs для отмены запросов
  const abortControllers = useRef({
    shibe: null,
    activity: null
  });

  // Универсальный fetch с таймаутом
  const fetchData = async (type) => {
    // Отменяем предыдущий запрос
    if (abortControllers.current[type]) {
      abortControllers.current[type].abort();
    }

    // Создаем новый AbortController
    const controller = new AbortController();
    abortControllers.current[type] = controller;

    setLoading(prev => ({ ...prev, [type]: true }));
    setError(prev => ({ ...prev, [type]: null }));

    const urls = {
      shibe: 'https://shibe.online/api/shibes?count=1',
      activity: 'https://www.boredapi.com/api/activity'
    };

    try {
      // Таймаут 5 секунд
      const timeout = setTimeout(() => {
        controller.abort();
      }, 5000);

      const response = await fetch(urls[type], {
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const result = type === 'shibe' ? data[0] : data;

      if (!result) {
        throw new Error('Invalid data format');
      }

      type === 'shibe' ? setShibeImage(result) : setActivity(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(prev => ({ ...prev, [type]: err.message }));
      }
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchData('shibe');
    fetchData('activity');

    return () => {
      // Отмена всех запросов при размонтировании
      Object.values(abortControllers.current).forEach(controller => {
        if (controller) controller.abort();
      });
    };
  }, []);

  return (
    <div className="app">
      <header>
        <h1>API Demo</h1>
        <p>Работает исключительно через внешние API</p>
      </header>

      <div className="content">
        {/* Блок с собачками */}
        <section className="shibe-section">
          <h2>Random Shiba Inu</h2>
          
          {loading.shibe ? (
            <div className="loader">
              <div className="spinner"></div>
              <p>Loading image...</p>
            </div>
          ) : (
            <>
              {error.shibe && (
                <div className="error">
                  <p>⚠️ Error: {error.shibe}</p>
                  <button onClick={() => fetchData('shibe')}>Retry</button>
                </div>
              )}
              
              {shibeImage && (
                <div className="image-wrapper">
                  <img 
                    src={shibeImage} 
                    alt="Random Shiba Inu"
                  />
                </div>
              )}
            </>
          )}
          
          <button 
            onClick={() => fetchData('shibe')}
            disabled={loading.shibe}
          >
            {loading.shibe ? 'Loading...' : 'New Shibe'}
          </button>
        </section>

        {/* Блок с активностями */}
        <section className="activity-section">
          <h2>Random Activity</h2>
          
          {loading.activity ? (
            <div className="loader">
              <div className="spinner"></div>
              <p>Loading activity...</p>
            </div>
          ) : (
            <>
              {error.activity && (
                <div className="error">
                  <p>⚠️ Error: {error.activity}</p>
                  <button onClick={() => fetchData('activity')}>Retry</button>
                </div>
              )}
              
              {activity && (
                <div className="activity-card">
                  <h3>{activity.activity}</h3>
                  <p><strong>Type:</strong> {activity.type}</p>
                  <p><strong>Participants:</strong> {activity.participants}</p>
                </div>
              )}
            </>
          )}
          
          <button 
            onClick={() => fetchData('activity')}
            disabled={loading.activity}
          >
            {loading.activity ? 'Loading...' : 'New Activity'}
          </button>
        </section>
      </div>
    </div>
  );
};

export default App;

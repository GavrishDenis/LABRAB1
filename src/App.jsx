import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // Состояния для данных API
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

  // 1. Загрузка изображения сиба-ину
  const fetchShibe = async () => {
    try {
      setLoading(prev => ({ ...prev, shibe: true }));
      setError(prev => ({ ...prev, shibe: null }));
      
      const response = await fetch('https://shibe.online/api/shibes?count=1');
      
      if (!response.ok) throw new Error('Ошибка загрузки изображения');
      
      const data = await response.json();
      setShibeImage(data[0]);
    } catch (err) {
      setError(prev => ({ ...prev, shibe: err.message }));
      // Fallback изображение
      setShibeImage('https://cdn.shibe.online/shibes/1.jpg');
    } finally {
      setLoading(prev => ({ ...prev, shibe: false }));
    }
  };

  // 2. Загрузка случайной активности
  const fetchActivity = async () => {
    try {
      setLoading(prev => ({ ...prev, activity: true }));
      setError(prev => ({ ...prev, activity: null }));
      
      const response = await fetch('https://www.boredapi.com/api/activity');
      
      if (!response.ok) throw new Error('Ошибка загрузки активности');
      
      const data = await response.json();
      setActivity(data);
    } catch (err) {
      setError(prev => ({ ...prev, activity: err.message }));
      // Fallback активность
      setActivity({
        activity: "Read a book",
        type: "education",
        participants: 1
      });
    } finally {
      setLoading(prev => ({ ...prev, activity: false }));
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchShibe();
    fetchActivity();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>API Demo: Shibes & Activities</h1>
      </header>

      <div className="api-blocks">
        {/* Блок с изображением сиба-ину */}
        <div className="api-block">
          <h2>Random Shiba Inu</h2>
          {loading.shibe ? (
            <div className="loader">Loading shibe...</div>
          ) : (
            <>
              {error.shibe && <div className="error">{error.shibe}</div>}
              <div className="image-container">
                {shibeImage && (
                  <img 
                    src={shibeImage} 
                    alt="Random shiba inu"
                    onError={(e) => {
                      e.target.src = 'https://cdn.shibe.online/shibes/1.jpg';
                    }}
                  />
                )}
              </div>
              <button 
                onClick={fetchShibe}
                disabled={loading.shibe}
              >
                {loading.shibe ? 'Loading...' : 'New Shibe'}
              </button>
            </>
          )}
        </div>

        {/* Блок с активностью */}
        <div className="api-block">
          <h2>Random Activity</h2>
          {loading.activity ? (
            <div className="loader">Loading activity...</div>
          ) : (
            <>
              {error.activity && <div className="error">{error.activity}</div>}
              {activity && (
                <div className="activity-card">
                  <h3>{activity.activity}</h3>
                  <p>Type: {activity.type}</p>
                  <p>Participants: {activity.participants}</p>
                </div>
              )}
              <button 
                onClick={fetchActivity}
                disabled={loading.activity}
              >
                {loading.activity ? 'Loading...' : 'New Activity'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

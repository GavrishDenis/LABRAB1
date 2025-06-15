import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [btcPrice, setBtcPrice] = useState(null);
  const [catFact, setCatFact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Запрос курса биткоина через российский прокси
        const btcResponse = await fetch('https://cryptoprice.vercel.app/api/coingecko?ids=bitcoin&vs_currencies=rub');
        const btcData = await btcResponse.json();
        setBtcPrice(btcData.bitcoin?.rub || 'Нет данных');
        
        // 2. Альтернативный API фактов о котах
        const catResponse = await fetch('https://catfact.ninja/fact');
        const catData = await catResponse.json();
        setCatFact(catData.fact || 'Не удалось загрузить факт');
        
      } catch (err) {
        setError('Ошибка загрузки. Обновите страницу или попробуйте позже.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    setError(null);
    fetchData();
  };

  return (
    <div className="app">
      <h1>Курс биткоина и факты о котах</h1>
      
      {error && (
        <div className="error">
          {error}
          <button onClick={refreshData}>Попробовать снова</button>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>BTC/RUB</h2>
            <p className="price">{btcPrice} ₽</p>
            <small>Источник: CoinGecko (через прокси)</small>
          </div>

          <div className="card">
            <h2>Факт о котах</h2>
            <p className="fact">{catFact}</p>
            <button onClick={refreshData}>Новый факт</button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;

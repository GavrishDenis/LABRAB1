import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // Состояние для блока с биткоином
  const [btcData, setBtcData] = useState({
    price: null,
    loading: true,
    error: null
  });

  // Состояние для блока с фактами о котах
  const [catData, setCatData] = useState({
    fact: null,
    loading: true,
    error: null
  });

  // Функция для загрузки курса биткоина
  const fetchBitcoinPrice = async () => {
    try {
      setBtcData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub');
      if (!response.ok) throw new Error('Не удалось загрузить курс');
      
      const data = await response.json();
      setBtcData({
        price: data.bitcoin?.rub || 'Нет данных',
        loading: false,
        error: null
      });
    } catch (err) {
      setBtcData({
        ...btcData,
        loading: false,
        error: err.message
      });
    }
  };

  // Функция для загрузки фактов о котах
  const fetchCatFact = async () => {
    try {
      setCatData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('https://catfact.ninja/fact');
      if (!response.ok) throw new Error('Не удалось загрузить факт');
      
      const data = await response.json();
      setCatData({
        fact: data.fact || 'Нет данных',
        loading: false,
        error: null
      });
    } catch (err) {
      setCatData({
        ...catData,
        loading: false,
        error: err.message
      });
    }
  };

  // Первоначальная загрузка данных
  useEffect(() => {
    fetchBitcoinPrice();
    fetchCatFact();
  }, []);

  return (
    <div className="app">
      <h1>Курс биткоина и факты о котах</h1>
      
      <div className="content">
        {/* Блок с курсом биткоина */}
        <div className="card">
          <h2>BTC/RUB</h2>
          
          {btcData.loading ? (
            <div className="loading">Загрузка курса...</div>
          ) : btcData.error ? (
            <div className="error">{btcData.error}</div>
          ) : (
            <p className="price">{btcData.price} ₽</p>
          )}
          
          <button 
            onClick={fetchBitcoinPrice}
            disabled={btcData.loading}
          >
            {btcData.loading ? 'Обновление...' : 'Обновить курс'}
          </button>
        </div>

        {/* Блок с фактами о котах */}
        <div className="card">
          <h2>Факт о котах</h2>
          
          {catData.loading ? (
            <div className="loading">Загрузка факта...</div>
          ) : catData.error ? (
            <div className="error">{catData.error}</div>
          ) : (
            <p className="fact">{catData.fact}</p>
          )}
          
          <button 
            onClick={fetchCatFact}
            disabled={catData.loading}
          >
            {catData.loading ? 'Загрузка...' : 'Новый факт'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

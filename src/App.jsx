import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // Состояние для биткоина
  const [btcPrice, setBtcPrice] = useState(null);
  const [btcLoading, setBtcLoading] = useState(true);
  const [btcError, setBtcError] = useState(null);

  // Состояние для фактов о котах
  const [catFact, setCatFact] = useState(null);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(null);

  // Общее состояние ошибки
  const [globalError, setGlobalError] = useState(null);

  // Загрузка курса биткоина
  const fetchBtcPrice = async () => {
    try {
      setBtcLoading(true);
      setBtcError(null);
      
      const response = await fetch('https://cryptoprice.vercel.app/api/coingecko?ids=bitcoin&vs_currencies=rub');
      if (!response.ok) throw new Error('Ошибка загрузки курса');
      
      const data = await response.json();
      setBtcPrice(data.bitcoin?.rub || 'Нет данных');
    } catch (err) {
      setBtcError(err.message);
      console.error('BTC API Error:', err);
    } finally {
      setBtcLoading(false);
    }
  };

  // Загрузка фактов о котах
  const fetchCatFact = async () => {
    try {
      setCatLoading(true);
      setCatError(null);
      
      const response = await fetch('https://catfact.ninja/fact');
      if (!response.ok) throw new Error('Ошибка загрузки факта');
      
      const data = await response.json();
      setCatFact(data.fact || 'Не удалось загрузить факт');
    } catch (err) {
      setCatError(err.message);
      console.error('Cat API Error:', err);
    } finally {
      setCatLoading(false);
    }
  };

  // Первоначальная загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchBtcPrice(), fetchCatFact()]);
      } catch (err) {
        setGlobalError('Ошибка при загрузке данных');
      }
    };

    loadData();
  }, []);

  return (
    <div className="app">
      <h1>Курс биткоина и факты о котах</h1>
      
      {globalError && (
        <div className="error">
          {globalError}
          <button onClick={() => window.location.reload()}>Обновить страницу</button>
        </div>
      )}

      <div className="content">
        {/* Блок с курсом биткоина */}
        <div className="card">
          <h2>BTC/RUB</h2>
          
          {btcLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Загрузка курса...</p>
            </div>
          ) : btcError ? (
            <div className="error">
              {btcError}
              <button onClick={fetchBtcPrice}>Попробовать снова</button>
            </div>
          ) : (
            <>
              <p className="price">{btcPrice} ₽</p>
              <small>Источник: CoinGecko (через прокси)</small>
            </>
          )}
          
          <button 
            onClick={fetchBtcPrice}
            disabled={btcLoading}
          >
            {btcLoading ? 'Обновление...' : 'Обновить курс'}
          </button>
        </div>

        {/* Блок с фактами о котах */}
        <div className="card">
          <h2>Факт о котах</h2>
          
          {catLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Загрузка факта...</p>
            </div>
          ) : catError ? (
            <div className="error">
              {catError}
              <button onClick={fetchCatFact}>Попробовать снова</button>
            </div>
          ) : (
            <p className="fact">{catFact}</p>
          )}
          
          <button 
            onClick={fetchCatFact}
            disabled={catLoading}
          >
            {catLoading ? 'Загрузка...' : 'Новый факт'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

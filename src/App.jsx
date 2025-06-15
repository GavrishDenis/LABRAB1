import React, { useState, useEffect } from 'react';
import './App.css';

// Прокси-сервер для обхода CORS (можно заменить на свой)
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

const App = () => {
  const [btcPrice, setBtcPrice] = useState('—');
  const [catFact, setCatFact] = useState('—');
  const [btcLoading, setBtcLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [btcError, setBtcError] = useState(null);
  const [catError, setCatError] = useState(null);
  const [btcSource, setBtcSource] = useState('');
  const [catSource, setCatSource] = useState('');

  // Альтернативные API для курса биткоина
  const fetchBitcoinPrice = async () => {
    setBtcLoading(true);
    setBtcError(null);
    
    const endpoints = [
      {
        url: `${PROXY_URL}https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub`,
        name: 'CoinGecko',
        parser: (data) => data.bitcoin?.rub
      },
      {
        url: `${PROXY_URL}https://api.coincap.io/v2/assets/bitcoin`,
        name: 'CoinCap',
        parser: (data) => (data.data?.priceUsd * 73).toFixed(2) // Конвертация USD в RUB
      },
      {
        url: `${PROXY_URL}https://api.binance.com/api/v3/ticker/price?symbol=BTCRUB`,
        name: 'Binance',
        parser: (data) => data.price
      }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        const price = endpoint.parser(data);
        
        if (price) {
          setBtcPrice(price);
          setBtcSource(endpoint.name);
          return;
        }
      } catch (err) {
        console.error(`Ошибка в ${endpoint.name}:`, err);
      }
    }
    
    setBtcError('Не удалось загрузить курс');
    setBtcLoading(false);
  };

  // Альтернативные API для фактов о котах
  const fetchCatFact = async () => {
    setCatLoading(true);
    setCatError(null);
    
    const endpoints = [
      {
        url: 'https://catfact.ninja/fact',
        name: 'CatFactNinja',
        parser: (data) => data.fact
      },
      {
        url: 'https://meowfacts.herokuapp.com/',
        name: 'MeowFacts',
        parser: (data) => data.data?.[0]
      },
      {
        url: 'https://some-random-api.com/facts/cat',
        name: 'SomeRandomAPI',
        parser: (data) => data.fact
      }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);
        if (!response.ok) continue;
        
        const data = await response.json();
        const fact = endpoint.parser(data);
        
        if (fact) {
          setCatFact(fact);
          setCatSource(endpoint.name);
          return;
        }
      } catch (err) {
        console.error(`Ошибка в ${endpoint.name}:`, err);
      }
    }
    
    setCatError('Не удалось загрузить факт');
    setCatLoading(false);
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
        {/* Блок курса биткоина */}
        <div className={`card ${btcLoading ? 'loading' : ''}`}>
          <h2>BTC/RUB</h2>
          
          {btcError ? (
            <div className="error">
              <p>{btcError}</p>
              <button onClick={fetchBitcoinPrice} disabled={btcLoading}>
                {btcLoading ? 'Попытка...' : 'Попробовать снова'}
              </button>
            </div>
          ) : (
            <>
              <p className="price">{btcPrice} ₽</p>
              {btcSource && <small>Источник: {btcSource}</small>}
              <button onClick={fetchBitcoinPrice} disabled={btcLoading}>
                {btcLoading ? 'Обновление...' : 'Обновить курс'}
              </button>
            </>
          )}
        </div>

        {/* Блок фактов о котах */}
        <div className={`card ${catLoading ? 'loading' : ''}`}>
          <h2>Факт о котах</h2>
          
          {catError ? (
            <div className="error">
              <p>{catError}</p>
              <button onClick={fetchCatFact} disabled={catLoading}>
                {catLoading ? 'Попытка...' : 'Попробовать снова'}
              </button>
            </div>
          ) : (
            <>
              <p className="fact">{catFact}</p>
              {catSource && <small>Источник: {catSource}</small>}
              <button onClick={fetchCatFact} disabled={catLoading}>
                {catLoading ? 'Загрузка...' : 'Новый факт'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

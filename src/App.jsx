import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // Состояния для биткоина
  const [btcData, setBtcData] = useState({
    price: null,
    loading: true,
    error: null,
    source: ''
  });

  // Состояния для фактов о котах
  const [catData, setCatData] = useState({
    fact: null,
    loading: true,
    error: null,
    source: ''
  });

  // Список альтернативных API для биткоина
  const BTC_API_PROVIDERS = [
    {
      name: 'CoinGecko',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub',
      parser: (data) => data.bitcoin?.rub
    },
    {
      name: 'Binance',
      url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCRUB',
      parser: (data) => parseFloat(data.price).toFixed(2)
    },
    {
      name: 'CryptoCompare',
      url: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=RUB',
      parser: (data) => data.RUB
    }
  ];

  // Список альтернативных API для фактов
  const CAT_API_PROVIDERS = [
    {
      name: 'CatFactNinja',
      url: 'https://catfact.ninja/fact',
      parser: (data) => data.fact
    },
    {
      name: 'MeowFacts',
      url: 'https://meowfacts.herokuapp.com/',
      parser: (data) => data.data?.[0]
    },
    {
      name: 'SomeRandomAPI',
      url: 'https://some-random-api.ml/facts/cat',
      parser: (data) => data.fact
    }
  ];

  // Универсальная функция для запросов с перебором провайдеров
  const fetchData = async (providers, setData) => {
    let lastError = null;
    
    for (const provider of providers) {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch(provider.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const result = provider.parser(data);
        
        if (result) {
          setData({
            price: providers === BTC_API_PROVIDERS ? result : null,
            fact: providers === CAT_API_PROVIDERS ? result : null,
            loading: false,
            error: null,
            source: provider.name
          });
          return;
        }
      } catch (err) {
        lastError = err;
        console.error(`Ошибка в ${provider.name}:`, err);
      }
    }
    
    setData(prev => ({
      ...prev,
      loading: false,
      error: lastError?.message || 'Все API недоступны',
      source: ''
    }));
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchData(BTC_API_PROVIDERS, setBtcData);
    fetchData(CAT_API_PROVIDERS, setCatData);
  }, []);

  return (
    <div className="app">
      <h1>Курс биткоина и факты о котах</h1>
      
      <div className="content">
        {/* Блок курса биткоина */}
        <div className={`card ${btcData.loading ? 'loading' : ''}`}>
          <h2>BTC/RUB</h2>
          
          {btcData.loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Загрузка курса...</p>
            </div>
          ) : btcData.error ? (
            <div className="error">
              <p>⚠️ Ошибка: {btcData.error}</p>
              <button onClick={() => fetchData(BTC_API_PROVIDERS, setBtcData)}>
                Попробовать снова
              </button>
            </div>
          ) : (
            <>
              <p className="price">{btcData.price} ₽</p>
              <small>Источник: {btcData.source}</small>
              <button 
                onClick={() => fetchData(BTC_API_PROVIDERS, setBtcData)}
                disabled={btcData.loading}
              >
                {btcData.loading ? 'Обновление...' : 'Обновить курс'}
              </button>
            </>
          )}
        </div>

        {/* Блок фактов о котах */}
        <div className={`card ${catData.loading ? 'loading' : ''}`}>
          <h2>Факт о котах</h2>
          
          {catData.loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Загрузка факта...</p>
            </div>
          ) : catData.error ? (
            <div className="error">
              <p>⚠️ Ошибка: {catData.error}</p>
              <button onClick={() => fetchData(CAT_API_PROVIDERS, setCatData)}>
                Попробовать снова
              </button>
            </div>
          ) : (
            <>
              <p className="fact">{catData.fact}</p>
              <small>Источник: {catData.source}</small>
              <button 
                onClick={() => fetchData(CAT_API_PROVIDERS, setCatData)}
                disabled={catData.loading}
              >
                {catData.loading ? 'Загрузка...' : 'Новый факт'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // Состояния для биткоина
  const [btcData, setBtcData] = useState({
    price: null,
    loading: true,
    error: null,
    source: ''
  });

  // Состояния для фактов о котах
  const [catData, setCatData] = useState({
    fact: null,
    loading: true,
    error: null,
    source: ''
  });

  // Список альтернативных API для биткоина
  const BTC_API_PROVIDERS = [
    {
      name: 'CoinGecko',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub',
      parser: (data) => data.bitcoin?.rub
    },
    {
      name: 'Binance',
      url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCRUB',
      parser: (data) => parseFloat(data.price).toFixed(2)
    },
    {
      name: 'CryptoCompare',
      url: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=RUB',
      parser: (data) => data.RUB
    }
  ];

  // Список альтернативных API для фактов
  const CAT_API_PROVIDERS = [
    {
      name: 'CatFactNinja',
      url: 'https://catfact.ninja/fact',
      parser: (data) => data.fact
    },
    {
      name: 'MeowFacts',
      url: 'https://meowfacts.herokuapp.com/',
      parser: (data) => data.data?.[0]
    },
    {
      name: 'SomeRandomAPI',
      url: 'https://some-random-api.ml/facts/cat',
      parser: (data) => data.fact
    }
  ];

  // Универсальная функция для запросов с перебором провайдеров
  const fetchData = async (providers, setData) => {
    let lastError = null;
    
    for (const provider of providers) {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch(provider.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const result = provider.parser(data);
        
        if (result) {
          setData({
            price: providers === BTC_API_PROVIDERS ? result : null,
            fact: providers === CAT_API_PROVIDERS ? result : null,
            loading: false,
            error: null,
            source: provider.name
          });
          return;
        }
      } catch (err) {
        lastError = err;
        console.error(`Ошибка в ${provider.name}:`, err);
      }
    }
    
    setData(prev => ({
      ...prev,
      loading: false,
      error: lastError?.message || 'Все API недоступны',
      source: ''
    }));
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchData(BTC_API_PROVIDERS, setBtcData);
    fetchData(CAT_API_PROVIDERS, setCatData);
  }, []);

  return (
    <div className="app">
      <h1>Курс биткоина и факты о котах</h1>
      
      <div className="content">
        {/* Блок курса биткоина */}
        <div className={`card ${btcData.loading ? 'loading' : ''}`}>
          <h2>BTC/RUB</h2>
          
          {btcData.loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Загрузка курса...</p>
            </div>
          ) : btcData.error ? (
            <div className="error">
              <p>⚠️ Ошибка: {btcData.error}</p>
              <button onClick={() => fetchData(BTC_API_PROVIDERS, setBtcData)}>
                Попробовать снова
              </button>
            </div>
          ) : (
            <>
              <p className="price">{btcData.price} ₽</p>
              <small>Источник: {btcData.source}</small>
              <button 
                onClick={() => fetchData(BTC_API_PROVIDERS, setBtcData)}
                disabled={btcData.loading}
              >
                {btcData.loading ? 'Обновление...' : 'Обновить курс'}
              </button>
            </>
          )}
        </div>

        {/* Блок фактов о котах */}
        <div className={`card ${catData.loading ? 'loading' : ''}`}>
          <h2>Факт о котах</h2>
          
          {catData.loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Загрузка факта...</p>
            </div>
          ) : catData.error ? (
            <div className="error">
              <p>⚠️ Ошибка: {catData.error}</p>
              <button onClick={() => fetchData(CAT_API_PROVIDERS, setCatData)}>
                Попробовать снова
              </button>
            </div>
          ) : (
            <>
              <p className="fact">{catData.fact}</p>
              <small>Источник: {catData.source}</small>
              <button 
                onClick={() => fetchData(CAT_API_PROVIDERS, setCatData)}
                disabled={catData.loading}
              >
                {catData.loading ? 'Загрузка...' : 'Новый факт'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

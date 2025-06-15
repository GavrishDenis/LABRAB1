import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

const App = () => {
  const [animeQuote, setAnimeQuote] = useState(null);
  const [catFact, setCatFact] = useState(null);
  const [loading, setLoading] = useState({
    quote: true,
    fact: true
  });
  const [error, setError] = useState({
    quote: null,
    fact: null
  });
  const [showContent, setShowContent] = useState(false);
  const loadingScreenRef = useRef(null);

  // Refs для отмены запросов
  const abortControllers = useRef({
    quote: null,
    fact: null
  });

  // Скрытие экрана загрузки
  const hideLoadingScreen = () => {
    setShowContent(true);
    if (loadingScreenRef.current) {
      loadingScreenRef.current.style.opacity = '0';
      setTimeout(() => {
        loadingScreenRef.current.remove();
      }, 500);
    }
  };

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
      quote: 'https://animechan.xyz/api/random',
      fact: 'https://catfact.ninja/fact'
    };

    try {
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
      type === 'quote' ? setAnimeQuote(data) : setCatFact(data);
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
    const loadAllData = async () => {
      await Promise.all([
        fetchData('quote'),
        fetchData('fact')
      ]);
      hideLoadingScreen();
    };

    loadAllData();

    return () => {
      Object.values(abortControllers.current).forEach(controller => {
        if (controller) controller.abort();
      });
    };
  }, []);

  if (!showContent) {
    return (
      <div id="loading-screen" ref={loadingScreenRef}>
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Anime Quotes & Cat Facts</h1>
        <p>Powered by external APIs</p>
      </header>

      <div className="content">
        <section className="quote-section">
          <h2>Random Anime Quote</h2>
          {loading.quote ? (
            <div className="loader">
              <div className="spinner"></div>
              <p>Loading quote...</p>
            </div>
          ) : (
            <>
              {error.quote && (
                <div className="error">
                  <p>⚠️ Error: {error.quote}</p>
                  <button onClick={() => fetchData('quote')}>Retry</button>
                </div>
              )}
              {animeQuote && (
                <div className="quote-card">
                  <blockquote>"{animeQuote.quote}"</blockquote>
                  <div className="quote-meta">
                    <p><strong>Anime:</strong> {animeQuote.anime}</p>
                    <p><strong>Character:</strong> {animeQuote.character}</p>
                  </div>
                </div>
              )}
            </>
          )}
          <button 
            onClick={() => fetchData('quote')}
            disabled={loading.quote}
          >
            {loading.quote ? 'Loading...' : 'New Quote'}
          </button>
        </section>

        <section className="fact-section">
          <h2>Random Cat Fact</h2>
          {loading.fact ? (
            <div className="loader">
              <div className="spinner"></div>
              <p>Loading fact...</p>
            </div>
          ) : (
            <>
              {error.fact && (
                <div className="error">
                  <p>⚠️ Error: {error.fact}</p>
                  <button onClick={() => fetchData('fact')}>Retry</button>
                </div>
              )}
              {catFact && (
                <div className="fact-card">
                  <p className="fact-text">{catFact.fact}</p>
                  <p className="fact-length">Length: {catFact.length} chars</p>
                </div>
              )}
            </>
          )}
          <button 
            onClick={() => fetchData('fact')}
            disabled={loading.fact}
          >
            {loading.fact ? 'Loading...' : 'New Fact'}
          </button>
        </section>
      </div>
    </div>
  );
};

// Создаем корень приложения
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендерим приложение
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

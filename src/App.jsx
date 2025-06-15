import React, { useState, useEffect, useRef } from 'react';
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

  const abortControllers = useRef({
    quote: null,
    fact: null
  });

  const fetchData = async (type) => {
    if (abortControllers.current[type]) {
      abortControllers.current[type].abort();
    }

    const controller = new AbortController();
    abortControllers.current[type] = controller;

    setLoading(prev => ({ ...prev, [type]: true }));
    setError(prev => ({ ...prev, [type]: null }));

    const urls = {
      quote: 'https://animechan.xyz/api/random',
      fact: 'https://catfact.ninja/fact'
    };

    try {
      const response = await fetch(urls[type], {
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      type === 'quote' ? setAnimeQuote(data) : setCatFact(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(prev => ({ ...prev, [type]: err.message || 'Failed to fetch data' }));
      }
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        await Promise.all([fetchData('quote'), fetchData('fact')]);
      } finally {
        if (mounted) setShowContent(true);
      }
    };

    loadData();

    return () => {
      mounted = false;
      Object.values(abortControllers.current).forEach(controller => {
        if (controller) controller.abort();
      });
    };
  }, []);

  if (!showContent) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* ... остальной JSX без изменений ... */}
    </div>
  );
};

export default App;

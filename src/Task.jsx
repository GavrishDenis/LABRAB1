import React, { useState, useEffect } from 'react';

const Task = ({ title, apiUrl, type }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Обрабатываем разные форматы ответов от API
        if (type === 'crypto') {
          setData({
            price: result.bitcoin.rub,
            currency: 'RUB'
          });
        } else if (type === 'cat') {
          setData({
            fact: result.data[0]
          });
        }
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Для котировок устанавливаем интервал обновления
    if (type === 'crypto') {
      const interval = setInterval(fetchData, 60000); // Обновляем каждую минуту
      return () => clearInterval(interval);
    }
  }, [apiUrl, type]);

  return (
    <section className={`task-section ${type}`}>
      <h2>{title}</h2>
      
      {loading ? (
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : error ? (
        <div className="error">
          <p>⚠️ Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <div className="data-card">
          {type === 'crypto' && data && (
            <>
              <p className="price">{data.price} {data.currency}</p>
              <p className="updated">Updated: {new Date().toLocaleTimeString()}</p>
            </>
          )}
          
          {type === 'cat' && data && (
            <p className="fact">{data.fact}</p>
          )}
        </div>
      )}
      
      <button 
        onClick={() => window.location.reload()}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Refresh'}
      </button>
    </section>
  );
};

export default Task;

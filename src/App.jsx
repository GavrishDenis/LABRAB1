import React, { useState, useEffect } from 'react';
import Task from './Task';
import './App.css';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Можно добавить общую загрузку данных при необходимости
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Crypto & Cat Facts</h1>
        <p>Real-time data from public APIs</p>
      </header>
      <div className="content">
        <Task 
          title="Bitcoin Price" 
          apiUrl="https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub" 
          type="crypto" 
        />
        <Task 
          title="Random Cat Fact" 
          apiUrl="https://meowfacts.herokuapp.com/" 
          type="cat" 
        />
      </div>
    </div>
  );
};

export default App;

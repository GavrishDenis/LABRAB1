import React, { useState, useEffect } from 'react'
import './App.css'

const App = () => {
  const [btcPrice, setBtcPrice] = useState(null)
  const [catFact, setCatFact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Запрос курса биткоина
        const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub')
        const btcData = await btcResponse.json()
        setBtcPrice(btcData.bitcoin.rub)

        // Запрос факта о котах
        const catResponse = await fetch('https://meowfacts.herokuapp.com/')
        const catData = await catResponse.json()
        setCatFact(catData.data[0])

      } catch (err) {
        setError('Ошибка загрузки данных. Проверьте подключение к интернету.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="loading">Загрузка данных...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="app">
      <h1>Курс биткоина и факты о котах</h1>
      
      <div className="card">
        <h2>BTC/RUB</h2>
        <p className="price">{btcPrice} ₽</p>
      </div>

      <div className="card">
        <h2>Факт о котах</h2>
        <p className="fact">{catFact}</p>
      </div>
    </div>
  )
}

export default App

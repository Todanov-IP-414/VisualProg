import React, { useState } from 'react';
import { useWeather } from './hooks/useWeather';
import { SearchBar } from './components/SearchBar';
import { WeatherDashboard } from './components/WeatherDashboard';
import './App.css';

const getBackgroundClass = (weatherId?: number) => {
  if (!weatherId) return 'bg-default';
  if (weatherId >= 200 && weatherId < 600) return 'bg-rain';
  if (weatherId === 800) return 'bg-clear';
  if (weatherId > 800) return 'bg-cloudy';
  return 'bg-default';
};

export const App: React.FC = () => {
  const { city, current, pollution, forecast, loading, error, loadWeather } = useWeather();
  const bgClass = getBackgroundClass(current?.weather[0]?.id);

  return (
    <div className={`app-container ${bgClass}`}>
      <main className="main-content">
        <SearchBar onSearch={loadWeather} />
        
        {loading && <div className="loader">Loading weather data...</div>}
        {error && <div className="error-message">Error: {error}</div>}
        
        {current && !loading && (
          <WeatherDashboard 
            city={city!} 
            current={current} 
            pollution={pollution} 
            forecast={forecast} 
          />
        )}
      </main>
    </div>
  );
};
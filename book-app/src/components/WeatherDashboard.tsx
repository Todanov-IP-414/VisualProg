import React from 'react';
import type { CurrentWeather, AirPollution } from '../types/weather.ts';

interface DashboardProps {
  city: string;
  current: CurrentWeather;
  pollution: AirPollution | null;
  forecast: any;
}

export const WeatherDashboard: React.FC<DashboardProps> = ({ city, current, pollution, forecast }) => {
  const weather = current.weather[0];
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;
  const aqi = pollution?.list[0]?.main.aqi ?? 'N/A';

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>{city}</h2>
        <p className="date">{new Date(current.dt * 1000).toLocaleDateString()}</p>
      </header>

      <div className="current-weather">
        <img src={iconUrl} alt={weather.description} className="weather-icon" />
        <div className="temperature">
          <h1>{Math.round(current.main.temp)}°C</h1>
          <p>{weather.description}</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span>Humidity</span>
          <strong>{current.main.humidity}%</strong>
        </div>
        <div className="metric-card">
          <span>Wind</span>
          <strong>{current.wind.speed} m/s</strong>
        </div>
        <div className="metric-card">
          <span>Air Quality (AQI)</span>
          <strong>{aqi} / 5</strong>
        </div>
      </div>
    </div>
  );
};
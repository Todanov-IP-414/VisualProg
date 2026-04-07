import React from 'react';
import { formatDate } from '../utils/formatDate';

interface WeatherCardProps {
  dt: number;
  temp: number;
  icon: string;
  description: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ dt, temp, icon, description }) => {
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <div className="weather-card">
      <p className="card-date">{formatDate(dt)}</p>
      <img src={iconUrl} alt={description} title={description} />
      <p className="card-temp">{Math.round(temp)}°C</p>
    </div>
  );
};

export const ForecastList: React.FC<{ forecast: any }> = ({ forecast }) => {
  if (!forecast || !forecast.list) return null;

  return (
    <div className="forecast-list">
      {forecast.list.map((item: any, index: number) => (
        <WeatherCard 
          key={index}
          dt={item.dt}
          temp={item.main.temp}
          icon={item.weather[0].icon}
          description={item.weather[0].description}
        />
      ))}
    </div>
  );
};
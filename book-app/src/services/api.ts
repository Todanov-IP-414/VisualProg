import type { Coordinates, CurrentWeather, AirPollution } from '../types/weather';
import { mockWeather, mockPollution } from '../mocks/data';

const API_KEY = '0541c83e3d1ae2606784a10be1dae069';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const fetchCoordinates = async (city: string): Promise<Coordinates> => {
  if (USE_MOCKS) return { lat: 51.5074, lon: -0.1278 };

  const response = await fetch(`${GEO_URL}/direct?q=${city}&limit=1&appid=${API_KEY}`);
  if (!response.ok) throw new Error('Failed to fetch coordinates');
  const data = await response.json();
  if (!data.length) throw new Error('City not found');
  
  return { lat: data[0].lat, lon: data[0].lon };
};

export const fetchWeatherData = async (coords: Coordinates) => {
  if (USE_MOCKS) {
    return {
      current: mockWeather,
      pollution: mockPollution,
      forecast: []
    };
  }

  const { lat, lon } = coords;
  
  const [currentRes, pollutionRes, forecastRes] = await Promise.all([
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
    fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
    fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
  ]);

  if (!currentRes.ok || !pollutionRes.ok || !forecastRes.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return {
    current: await currentRes.json(),
    pollution: await pollutionRes.json(),
    forecast: await forecastRes.json()
  };
};
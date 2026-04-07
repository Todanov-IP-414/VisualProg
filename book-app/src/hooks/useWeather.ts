import { useState, useEffect, useCallback } from 'react';
import type { AppState } from '../types/weather';
import { fetchCoordinates, fetchWeatherData } from '../services/api';

const UPDATE_INTERVAL = 3 * 60 * 60 * 1000;

export const useWeather = () => {
  const [state, setState] = useState<AppState>({
    city: null,
    current: null,
    forecast: null,
    pollution: null,
    loading: false,
    error: null,
  });

  const loadWeather = useCallback(async (cityName: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const coords = await fetchCoordinates(cityName);
      const data = await fetchWeatherData(coords);
      
      setState({
        city: cityName,
        current: data.current,
        forecast: data.forecast,
        pollution: data.pollution,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => {
    if (!state.city) return;

    const intervalId = setInterval(() => {
      loadWeather(state.city!);
    }, UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [state.city, loadWeather]);

  return { ...state, loadWeather };
};
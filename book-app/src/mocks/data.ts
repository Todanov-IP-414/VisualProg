import type { CurrentWeather, AirPollution } from '../types/weather';

export const mockWeather: CurrentWeather = {
  main: { temp: 22.5, feels_like: 21.0, humidity: 45 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  wind: { speed: 3.5 },
  dt: Math.floor(Date.now() / 1000)
};

export const mockPollution: AirPollution = {
  list: [{
    main: { aqi: 2 },
    components: { co: 201.94, no: 0.02, no2: 0.17, o3: 68.66, so2: 0.61, pm2_5: 2.39, pm10: 3.14, nh3: 0.18 }
  }]
};

export const mockForecast = {
  list: [
    { dt: Math.floor(Date.now() / 1000) + 86400, main: { temp: 18 }, weather: [{ icon: '10d', description: 'rain' }] },
    { dt: Math.floor(Date.now() / 1000) + 172800, main: { temp: 20 }, weather: [{ icon: '02d', description: 'few clouds' }] },
    { dt: Math.floor(Date.now() / 1000) + 259200, main: { temp: 24 }, weather: [{ icon: '01d', description: 'clear sky' }] },
  ]
};
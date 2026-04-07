export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeocodingResponse extends Coordinates {
  name: string;
  country: string;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: WeatherCondition[];
  wind: { speed: number };
  dt: number;
}

export interface AirPollution {
  list: Array<{
    main: { aqi: number };
    components: Record<string, number>;
  }>;
}

export interface AppState {
  city: string | null;
  current: CurrentWeather | null;
  forecast: any | null;
  pollution: AirPollution | null;
  loading: boolean;
  error: string | null;
}
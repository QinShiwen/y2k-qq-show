import type { WeatherCondition } from "./consts";

export type WeatherConditionType =
  (typeof WeatherCondition)[keyof typeof WeatherCondition];

export type WeatherData = {
  weatherCondition: WeatherConditionType;
  temperature: string;
  humidity: string;
  sunrise: string;
  sunset: string;
  temperatureMax: string;
  temperatureMin: string;
};

export type WeatherCache = {
  fetchedAt: number;
  latitude: number;
  longitude: number;
  data: WeatherData;
};

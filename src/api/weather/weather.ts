import dayjs from "dayjs";

import {
  getCachedWeather,
  getCurrentPosition,
  rememberWeather,
  toWeatherCondition,
} from "./utils";
import type { WeatherConditionType } from "./types";

export type WeatherData = {
  weatherCondition: WeatherConditionType;
  temperature: string;
  humidity: string;
  sunrise: string;
  sunset: string;
  temperatureMax: string;
  temperatureMin: string;
};

const NA = "N/A";
const HMS_FORMAT = "HH:mm:ss";
export async function getWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "sunrise,sunset,temperature_2m_max,temperature_2m_min",
    current:
      "temperature_2m,is_day,weather_code,relative_humidity_2m,wind_speed_10m",
    timezone: "auto",
  });
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch weather: ${res.statusText}`);
  }

  const data = await res.json();

  const currentUnits = data?.current_units ?? {};
  const current = data?.current ?? {};
  const dailyUnits = data?.daily_units ?? {};
  const daily = data?.daily ?? {};

  const weatherCode = current?.weather_code ?? 0;
  const isDay = current?.is_day ?? false;
  const windSpeedKmh = current?.wind_speed_10m ?? 0;
  const weatherCondition = toWeatherCondition(weatherCode, isDay, windSpeedKmh);

  const temperature = `${current?.temperature_2m ?? NA} ${currentUnits?.temperature_2m ?? ""}`;
  const humidity = `${current?.relative_humidity_2m ?? NA} ${currentUnits?.relative_humidity_2m ?? ""}`;
  const sunrise = dayjs(daily?.sunrise?.[0]).format(HMS_FORMAT);
  const sunset = dayjs(daily?.sunset?.[0]).format(HMS_FORMAT);
  const temperatureMax = `${daily?.temperature_2m_max?.[0] ?? NA} ${dailyUnits?.temperature_2m_max ?? ""}`;
  const temperatureMin = `${daily?.temperature_2m_min?.[0] ?? NA} ${dailyUnits?.temperature_2m_min ?? ""}`;

  return {
    weatherCondition,
    temperature,
    humidity,
    sunrise,
    sunset,
    temperatureMax,
    temperatureMin,
  };
}

export async function getLocalWeather(): Promise<WeatherData> {
  const cached = getCachedWeather();
  if (cached) return cached;

  const position = await getCurrentPosition();
  const data = await getWeather(
    position.coords.latitude,
    position.coords.longitude,
  );
  rememberWeather(position.coords.latitude, position.coords.longitude, data);
  return data;
}

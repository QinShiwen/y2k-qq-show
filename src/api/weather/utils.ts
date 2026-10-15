import type { WeatherCache, WeatherConditionType, WeatherData } from "./types";
import {
  WEATHER_CACHE_KEY,
  WEATHER_CACHE_MS,
  WeatherCondition,
  WINDY_SPEED_KMH,
} from "./consts";

export function toWeatherCondition(
  weatherCode: number,
  isDay: boolean,
  windSpeedKmh: number,
): WeatherConditionType {
  if (weatherCode >= 95) return WeatherCondition.Thunderstorm;
  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    weatherCode === 85 ||
    weatherCode === 86
  ) {
    return WeatherCondition.Snow;
  }
  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    return WeatherCondition.Rain;
  }
  if (weatherCode === 45 || weatherCode === 48) {
    return WeatherCondition.Fog;
  }
  if (windSpeedKmh >= WINDY_SPEED_KMH) {
    return WeatherCondition.Windy;
  }
  if (weatherCode === 0) {
    return isDay ? WeatherCondition.Sunny : WeatherCondition.ClearNight;
  }
  if (weatherCode === 1) {
    return isDay ? WeatherCondition.MostlySunny : WeatherCondition.ClearNight;
  }
  if (weatherCode === 2) return WeatherCondition.PartlyCloudy;
  if (weatherCode === 3) return WeatherCondition.Cloudy;
  return isDay ? WeatherCondition.Sunny : WeatherCondition.ClearNight;
}

export function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 12000,
      maximumAge: WEATHER_CACHE_MS,
    });
  });
}

export function isWeatherData(value: unknown): value is WeatherData {
  if (!value || typeof value !== "object") return false;
  const data = value as WeatherData;
  return (
    Object.values(WeatherCondition).includes(data.weatherCondition) &&
    typeof data.temperature === "string" &&
    typeof data.temperatureMax === "string" &&
    typeof data.temperatureMin === "string"
  );
}

/**
 * @description Get the cached weather data from the session storage.
 */
export function getCachedWeather(): WeatherData | null {
  if (typeof sessionStorage === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeatherCache;
    if (
      typeof parsed.fetchedAt !== "number" ||
      Date.now() - parsed.fetchedAt > WEATHER_CACHE_MS ||
      !isWeatherData(parsed.data)
    ) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * @description Store the weather data in the session storage.
 */
export function rememberWeather(
  latitude: number,
  longitude: number,
  data: WeatherData,
) {
  if (typeof sessionStorage === "undefined") return;
  const payload: WeatherCache = {
    fetchedAt: Date.now(),
    latitude,
    longitude,
    data,
  };
  try {
    sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota errors. The hover card still shows this visit's forecast.
  }
}

export const WeatherCondition = {
  Sunny: "sunny",
  MostlySunny: "mostly_sunny",
  PartlyCloudy: "partly_cloudy",
  Cloudy: "cloudy",
  Rain: "rain",
  Thunderstorm: "thunderstorm",
  Snow: "snow",
  Fog: "fog",
  Windy: "windy",
  ClearNight: "clear_night",
} as const;

export const WINDY_SPEED_KMH = 36;
export const WEATHER_CACHE_KEY = "qq-show-weather";
export const WEATHER_CACHE_MS = 30 * 60 * 1000;

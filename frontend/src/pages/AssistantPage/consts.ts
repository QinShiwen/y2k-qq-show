import { WeatherCondition } from "../../api/weather/consts";
import type { WeatherConditionType } from "../../api/weather/types";

type IndividualWeatherInformation = {
  label: string;
  icon: string;
  hint: string;
};

export const weatherInformationMapping: Record<
  WeatherConditionType,
  IndividualWeatherInformation
> = {
  [WeatherCondition.Sunny]: {
    label: "Sunny",
    icon: "☀️",
    hint: "Sun's out. Go stretch a little.",
  },
  [WeatherCondition.MostlySunny]: {
    label: "Mostly Sunny",
    icon: "🌤️",
    hint: "Mostly bright today. Let it lift you.",
  },
  [WeatherCondition.PartlyCloudy]: {
    label: "Partly Cloudy",
    icon: "⛅",
    hint: "Clouds and sun, taking turns.",
  },
  [WeatherCondition.Cloudy]: {
    label: "Cloudy",
    icon: "☁️",
    hint: "Soft gray sky. Easy to slow down.",
  },
  [WeatherCondition.Rain]: {
    label: "Rain",
    icon: "🌧️",
    hint: "Rain's here. Don't forget your umbrella.",
  },
  [WeatherCondition.Thunderstorm]: {
    label: "Thunderstorm",
    icon: "⛈️",
    hint: "Storm outside. I'll stay in with you.",
  },
  [WeatherCondition.Snow]: {
    label: "Snow",
    icon: "❄️",
    hint: "Snow's falling. The world got quiet.",
  },
  [WeatherCondition.Fog]: {
    label: "Fog",
    icon: "🌫️",
    hint: "A little misty. Take it slow.",
  },
  [WeatherCondition.Windy]: {
    label: "Windy",
    icon: "💨",
    hint: "Bit windy. Tuck your collar in.",
  },
  [WeatherCondition.ClearNight]: {
    label: "Clear Night",
    icon: "🌙",
    hint: "Clear sky. The moon's keeping watch.",
  },
};

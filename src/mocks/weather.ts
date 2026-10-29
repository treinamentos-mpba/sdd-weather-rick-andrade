import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 123456,
    name: 'Campinas',
    latitude: -22.9056,
    longitude: -47.0608,
    admin1: 'São Paulo',
    country: 'Brasil',
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureC: 25.4,
    weatherCode: 1,
    observedAt: '2026-10-29T14:00',
    humidityPercent: 68,
    windSpeedKmh: 12.5,
    precipitationMm: 0,
    pressureHpa: 1014.2,
  },
  forecast: [
    {
      date: '2026-10-29',
      weatherCode: 1,
      temperatureMinC: 18.2,
      temperatureMaxC: 27.1,
      precipitationProbabilityPercent: 10,
    },
    {
      date: '2026-10-30',
      weatherCode: 3,
      temperatureMinC: 19,
      temperatureMaxC: 28,
      precipitationProbabilityPercent: 20,
    },
    {
      date: '2026-10-31',
      weatherCode: 61,
      temperatureMinC: 17.4,
      temperatureMaxC: 24.2,
      precipitationProbabilityPercent: 70,
    },
    {
      date: '2026-11-01',
      weatherCode: 0,
      temperatureMinC: 18,
      temperatureMaxC: 29,
      precipitationProbabilityPercent: 0,
    },
    {
      date: '2026-11-02',
      weatherCode: 80,
      temperatureMinC: 20,
      temperatureMaxC: 26,
      precipitationProbabilityPercent: 35,
    },
  ],
};

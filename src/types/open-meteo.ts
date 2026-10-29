export interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingCity[] | null;
}

export interface OpenMeteoGeocodingCity {
  id?: number | null;
  name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  country?: string | null;
  admin1?: string | null;
  timezone?: string | null;
}

export interface OpenMeteoForecastResponse {
  timezone?: string | null;
  current?: OpenMeteoCurrentResponse | null;
  daily?: OpenMeteoDailyResponse | null;
}

export interface OpenMeteoCurrentResponse {
  time?: string | null;
  temperature_2m?: number | null;
  weather_code?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
  pressure_msl?: number | null;
}

export interface OpenMeteoDailyResponse {
  time?: (string | null)[] | null;
  weather_code?: (number | null)[] | null;
  temperature_2m_min?: (number | null)[] | null;
  temperature_2m_max?: (number | null)[] | null;
  precipitation_probability_max?: (number | null)[] | null;
}

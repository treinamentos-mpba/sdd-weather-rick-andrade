export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  /** Identificador da cidade retornado pelo geocoding. */
  id: number;
  /** Nome da cidade. */
  name: string;
  /** Latitude usada nas consultas meteorológicas. */
  latitude: number;
  /** Longitude usada nas consultas meteorológicas. */
  longitude: number;
  /** Região administrativa, quando disponível. */
  admin1?: string;
  /** País, quando disponível. */
  country?: string;
  /** Fuso IANA retornado pelo geocoding, quando disponível. */
  timezone?: string;
}

export interface CurrentWeather {
  /** Temperatura atual em Celsius, correspondente a `temperature_2m`. */
  temperatureC: number | null;
  /** Código WMO da condição atual. */
  weatherCode: number | null;
  /** Horário local da observação, correspondente a `current.time`. */
  observedAt: string | null;
  /** Umidade relativa do ar em porcentagem. */
  humidityPercent: number | null;
  /** Velocidade do vento em quilômetros por hora. */
  windSpeedKmh: number | null;
  /** Precipitação em milímetros. */
  precipitationMm: number | null;
  /** Pressão ao nível do mar em hectopascais. */
  pressureHpa: number | null;
}

export interface ForecastDay {
  /** Data local no formato ISO `YYYY-MM-DD`. */
  date: string | null;
  /** Código WMO da condição prevista para o dia. */
  weatherCode: number | null;
  /** Temperatura mínima em Celsius. */
  temperatureMinC: number | null;
  /** Temperatura máxima em Celsius. */
  temperatureMaxC: number | null;
  /** Probabilidade máxima de precipitação em porcentagem. */
  precipitationProbabilityPercent: number | null;
}

export interface WeatherData {
  /** Cidade selecionada para a consulta. */
  city: City;
  /** Fuso IANA usado para interpretar horários e datas diárias. */
  timezone: string;
  /** Condições atuais retornadas pela API. */
  current: CurrentWeather;
  /** Datas locais previstas, em ordem cronológica. */
  forecast: ForecastDay[];
}

export type WeatherError =
  | { kind: 'timeout' }
  | { kind: 'network' }
  | { kind: 'api'; status?: number; reason?: string }
  | { kind: 'invalid-response' };

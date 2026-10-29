import type {
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingCity,
  OpenMeteoGeocodingResponse,
} from '../types/open-meteo';
import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 5;
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  readonly kind: 'timeout' | 'network' | 'api' | 'invalid-response';
  readonly status?: number;

  constructor(kind: WeatherServiceError['kind'], message: string, status?: number) {
    super(message);
    this.name = 'WeatherServiceError';
    this.kind = kind;
    this.status = status;
  }
}

function isAbortError(error: unknown): boolean {
  return (
    error !== null && typeof error === 'object' && 'name' in error && error.name === 'AbortError'
  );
}

export async function fetchWithTimeout<T = Response>(
  url: string,
  signal?: AbortSignal,
  consumeResponse?: (response: Response) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortRequest = () => controller.abort(signal?.reason);

  if (signal?.aborted) {
    controller.abort(signal.reason);
  } else {
    signal?.addEventListener('abort', abortRequest, { once: true });
  }

  try {
    const response = await fetch(url, { signal: controller.signal });
    return consumeResponse ? await consumeResponse(response) : (response as T);
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (isAbortError(error)) {
      throw new WeatherServiceError('timeout', 'A requisição demorou demais. Tente novamente.');
    }
    throw new WeatherServiceError(
      'network',
      'Sem conexão. Verifique sua internet e tente novamente.',
    );
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortRequest);
  }
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  return fetchWithTimeout<unknown>(url, signal, async (response) => {
    if (!response.ok) {
      throw new WeatherServiceError(
        'api',
        'Não foi possível consultar o clima agora. Tente novamente.',
        response.status,
      );
    }

    try {
      return await response.json();
    } catch (error) {
      if (isAbortError(error)) throw error;
      if (error instanceof SyntaxError) {
        throw new WeatherServiceError(
          'invalid-response',
          'O serviço retornou uma resposta inválida. Tente novamente.',
        );
      }
      throw error;
    }
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readNumber(value: unknown, _field: string): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new WeatherServiceError(
      'invalid-response',
      'O serviço retornou dados incompletos. Tente novamente.',
    );
  }
  return value;
}

function readString(value: unknown, _field: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    throw new WeatherServiceError(
      'invalid-response',
      'O serviço retornou dados incompletos. Tente novamente.',
    );
  }
  return value;
}

function readDailyDates(value: unknown): Array<string | null> {
  if (!Array.isArray(value) || value.length !== FORECAST_DAYS) {
    throw new WeatherServiceError(
      'invalid-response',
      'A previsão recebida está incompleta. Tente novamente.',
    );
  }

  return value.map((entry, index) => readString(entry, `daily.time[${index}]`));
}

function readDailyNumbers(value: unknown, _field: string, length: number): Array<number | null> {
  if (value === null || value === undefined) return Array.from({ length }, () => null);
  if (!Array.isArray(value) || value.length !== length) {
    throw new WeatherServiceError(
      'invalid-response',
      'A previsão recebida está incompleta. Tente novamente.',
    );
  }

  return value.map((entry, index) => readNumber(entry, `daily[${index}]`));
}

function isValidGeocodingCity(result: OpenMeteoGeocodingCity): result is OpenMeteoGeocodingCity & {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
} {
  return (
    typeof result.id === 'number' &&
    Number.isFinite(result.id) &&
    typeof result.name === 'string' &&
    result.name.trim().length > 0 &&
    typeof result.latitude === 'number' &&
    Number.isFinite(result.latitude) &&
    result.latitude >= -90 &&
    result.latitude <= 90 &&
    typeof result.longitude === 'number' &&
    Number.isFinite(result.longitude) &&
    result.longitude >= -180 &&
    result.longitude <= 180
  );
}

function mapCity(result: OpenMeteoGeocodingCity): City | null {
  if (!isValidGeocodingCity(result)) return null;

  return {
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    ...(typeof result.admin1 === 'string' ? { admin1: result.admin1 } : {}),
    ...(typeof result.country === 'string' ? { country: result.country } : {}),
    ...(typeof result.timezone === 'string' ? { timezone: result.timezone } : {}),
  };
}

function isGeocodingResponse(value: unknown): value is OpenMeteoGeocodingResponse {
  if (!isRecord(value)) return false;
  return value.results === undefined || value.results === null || Array.isArray(value.results);
}

function mapForecastDay(
  date: string | null,
  weatherCode: number | null,
  temperatureMinC: number | null,
  temperatureMaxC: number | null,
  precipitationProbabilityPercent: number | null,
): ForecastDay {
  return {
    date,
    weatherCode,
    temperatureMinC,
    temperatureMaxC,
    precipitationProbabilityPercent,
  };
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const query = name.trim();
  if (query.length === 0) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`;
  const payload = await fetchJson(url, signal);

  if (!isGeocodingResponse(payload)) {
    throw new WeatherServiceError(
      'invalid-response',
      'Não foi possível interpretar os resultados da busca. Tente novamente.',
    );
  }

  const results = payload.results ?? [];
  return results
    .filter((result): result is OpenMeteoGeocodingCity => isRecord(result))
    .map(mapCity)
    .filter((city): city is City => city !== null);
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,pressure_msl',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: String(FORECAST_DAYS),
  });
  const payload = await fetchJson(`${FORECAST_URL}?${params.toString()}`, signal);

  if (!isRecord(payload)) {
    throw new WeatherServiceError(
      'invalid-response',
      'Não foi possível interpretar a previsão recebida. Tente novamente.',
    );
  }

  const response = payload as OpenMeteoForecastResponse;
  if (!isRecord(response.current) || !isRecord(response.daily)) {
    throw new WeatherServiceError(
      'invalid-response',
      'A resposta do serviço de clima está incompleta. Tente novamente.',
    );
  }

  const timezone = readString(response.timezone, 'timezone');
  if (timezone === null || timezone.length === 0) {
    throw new WeatherServiceError(
      'invalid-response',
      'A resposta do serviço de clima está incompleta. Tente novamente.',
    );
  }

  const dailyDates = readDailyDates(response.daily.time);
  const weatherCodes = readDailyNumbers(
    response.daily.weather_code,
    'daily.weather_code',
    dailyDates.length,
  );
  const minTemperatures = readDailyNumbers(
    response.daily.temperature_2m_min,
    'daily.temperature_2m_min',
    dailyDates.length,
  );
  const maxTemperatures = readDailyNumbers(
    response.daily.temperature_2m_max,
    'daily.temperature_2m_max',
    dailyDates.length,
  );
  const precipitationProbabilities = readDailyNumbers(
    response.daily.precipitation_probability_max,
    'daily.precipitation_probability_max',
    dailyDates.length,
  );

  const current: CurrentWeather = {
    temperatureC: readNumber(response.current.temperature_2m, 'current.temperature_2m'),
    weatherCode: readNumber(response.current.weather_code, 'current.weather_code'),
    observedAt: readString(response.current.time, 'current.time'),
    humidityPercent: readNumber(
      response.current.relative_humidity_2m,
      'current.relative_humidity_2m',
    ),
    windSpeedKmh: readNumber(response.current.wind_speed_10m, 'current.wind_speed_10m'),
    precipitationMm:
      response.current.precipitation === null
        ? 0
        : readNumber(response.current.precipitation, 'current.precipitation'),
    pressureHpa: readNumber(response.current.pressure_msl, 'current.pressure_msl'),
  };

  const forecast = dailyDates.map((date, index) =>
    mapForecastDay(
      date,
      weatherCodes[index],
      minTemperatures[index],
      maxTemperatures[index],
      precipitationProbabilities[index],
    ),
  );

  return { city, timezone, current, forecast };
}

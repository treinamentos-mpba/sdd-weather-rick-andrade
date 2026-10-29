import { act, renderHook } from '@testing-library/react';
import { useWeather } from '../../../src/hooks/useWeather';
import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City, WeatherData } from '../../../src/types/weather';

vi.mock('../../../src/services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/services/weatherService')>();
  return { ...actual, getWeather: vi.fn(), searchCities: vi.fn() };
});

const city: City = {
  id: 1,
  name: 'Campinas',
  latitude: -22.9,
  longitude: -47.06,
};

const anotherCity: City = {
  id: 2,
  name: 'Curitiba',
  latitude: -25.4,
  longitude: -49.3,
};

const weatherData: WeatherData = {
  city,
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureC: 25,
    weatherCode: 1,
    observedAt: '2026-10-29T14:00',
    humidityPercent: 60,
    windSpeedKmh: 10,
    precipitationMm: 0,
    pressureHpa: 1014,
  },
  forecast: [],
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.mocked(searchCities).mockReset();
  vi.mocked(getWeather).mockReset();
});

describe('useWeather', () => {
  it('starts idle and does not search for an empty name', async () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');
    await act(async () => result.current.search('   '));

    expect(result.current.status).toBe('idle');
    expect(result.current.query).toBe('');
    expect(searchCities).not.toHaveBeenCalled();
  });

  it('searches and automatically loads the first city', async () => {
    vi.mocked(searchCities).mockResolvedValue([city, anotherCity]);
    vi.mocked(getWeather).mockResolvedValue(weatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('  Campinas  '));

    expect(searchCities).toHaveBeenCalledWith('Campinas', expect.any(AbortSignal));
    expect(result.current.cities).toEqual([city, anotherCity]);
    expect(getWeather).toHaveBeenCalledWith(city, expect.any(AbortSignal));
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(weatherData);
  });

  it('sets empty and skips forecast when no cities are found', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Cidade desconhecida'));

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('retries the last failed search', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(
        new WeatherServiceError(
          'network',
          'Sem conexão. Verifique sua internet e tente novamente.',
        ),
      )
      .mockResolvedValueOnce([city]);
    vi.mocked(getWeather).mockResolvedValue(weatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Campinas'));
    expect(result.current.status).toBe('error');
    expect(result.current.error).toMatchObject({
      kind: 'network',
      message: 'Sem conexão. Verifique sua internet e tente novamente.',
    });

    await act(async () => result.current.retry());

    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('retries a failed city selection without searching again', async () => {
    vi.mocked(getWeather)
      .mockRejectedValueOnce(
        new WeatherServiceError(
          'network',
          'Sem conexão. Verifique sua internet e tente novamente.',
        ),
      )
      .mockResolvedValueOnce(weatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(city));
    expect(result.current.status).toBe('error');

    await act(async () => result.current.retry());

    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(searchCities).not.toHaveBeenCalled();
    expect(result.current.status).toBe('success');
  });

  it('converts an unclassified offline TypeError to a friendly network error', async () => {
    vi.mocked(searchCities).mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Campinas'));

    expect(result.current.error).toMatchObject({
      kind: 'network',
      message: 'Sem conexão. Verifique sua internet e tente novamente.',
    });
  });

  it('ignores results from an older search', async () => {
    const oldSearch = deferred<City[]>();
    vi.mocked(searchCities)
      .mockReturnValueOnce(oldSearch.promise)
      .mockResolvedValueOnce([anotherCity]);
    vi.mocked(getWeather).mockResolvedValue({ ...weatherData, city: anotherCity });
    const { result } = renderHook(() => useWeather());
    let oldSearchPromise!: Promise<void>;

    act(() => {
      oldSearchPromise = result.current.search('Campinas');
    });
    await act(async () => result.current.search('Curitiba'));
    oldSearch.resolve([city]);
    await act(async () => oldSearchPromise);

    expect(result.current.query).toBe('Curitiba');
    expect(result.current.cities).toEqual([anotherCity]);
    expect(result.current.data?.city).toEqual(anotherCity);
  });
});

import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

const fetchMock = vi.fn<typeof fetch>();
const city: City = {
  id: 123,
  name: 'Campinas',
  latitude: -22.9,
  longitude: -47.06,
};

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('returns an empty list without calling the network for blank input', async () => {
    await expect(searchCities('   ')).resolves.toEqual([]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the name and maps valid results to City', async () => {
    const name = "L'Haÿ-les-Roses";
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 123,
            name,
            latitude: 48.78,
            longitude: 2.32,
            country: 'France',
            admin1: 'Île-de-France',
            timezone: 'Europe/Paris',
          },
          { id: 124, name: 'Inválida', latitude: 95, longitude: 2 },
        ],
      }),
    } as Response);

    await expect(searchCities(`  ${name}  `)).resolves.toEqual([
      {
        id: 123,
        name,
        latitude: 48.78,
        longitude: 2.32,
        country: 'France',
        admin1: 'Île-de-France',
        timezone: 'Europe/Paris',
      },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain(`name=${encodeURIComponent(name)}`);
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('throws WeatherServiceError for a non-ok response', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 } as Response);

    const error = await searchCities('Campinas').catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(WeatherServiceError);
    expect(error).toMatchObject({ kind: 'api', status: 503 });
  });

  it('returns an empty list when results is absent', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await expect(searchCities('Campinas')).resolves.toEqual([]);
  });

  it('throws WeatherServiceError for invalid JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('invalid JSON');
      },
    } as unknown as Response);

    await expect(searchCities('Campinas')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('classifies a network rejection', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network unavailable'));

    await expect(searchCities('Campinas')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: 'Sem conexão. Verifique sua internet e tente novamente.',
    });
  });

  it('classifies a malformed results field', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ results: 'not-an-array' }),
    } as Response);

    await expect(searchCities('Campinas')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it('times out after ten seconds with a WeatherServiceError', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );

    const request = searchCities('Campinas');
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: 'A requisição demorou demais. Tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await rejection;
  });

  it('converts an AbortError caused by explicit cancellation', async () => {
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    const controller = new AbortController();
    const request = searchCities('Campinas', controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: 'A requisição demorou demais. Tente novamente.',
    });
  });

  it('keeps the timeout active while reading the JSON body', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_input, init) =>
      Promise.resolve({
        ok: true,
        json: () =>
          new Promise<unknown>((_resolve, reject) => {
            init?.signal?.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          }),
      } as Response),
    );

    const request = searchCities('Campinas');
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: 'A requisição demorou demais. Tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await rejection;
  });

  it('clears the timeout after a successful fetch', async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue({ ok: true } as Response);

    await fetchWithTimeout('https://example.test/data');

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('getWeather', () => {
  const dates = ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'];

  it('requests forecast and maps current plus five parallel daily entries', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-29T14:00',
          temperature_2m: 25.4,
          weather_code: 1,
          relative_humidity_2m: 68,
          wind_speed_10m: 12.5,
          precipitation: 0,
          pressure_msl: 1014.2,
        },
        daily: {
          time: dates,
          weather_code: [1, 3, 61, 0, 80],
          temperature_2m_min: [18, 19, 17, 18, 20],
          temperature_2m_max: [27, 28, 24, 29, 26],
          precipitation_probability_max: [10, 20, 70, 0, 35],
        },
      }),
    } as Response);

    const result = await getWeather(city);
    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]));

    expect(requestUrl.origin + requestUrl.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(requestUrl.searchParams.get('latitude')).toBe(String(city.latitude));
    expect(requestUrl.searchParams.get('longitude')).toBe(String(city.longitude));
    expect(requestUrl.searchParams.get('current')).toContain('temperature_2m,weather_code');
    expect(requestUrl.searchParams.get('daily')).toContain('temperature_2m_min');
    expect(requestUrl.searchParams.get('timezone')).toBe('auto');
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(result.city).toBe(city);
    expect(result.current).toEqual({
      temperatureC: 25.4,
      weatherCode: 1,
      observedAt: '2026-10-29T14:00',
      humidityPercent: 68,
      windSpeedKmh: 12.5,
      precipitationMm: 0,
      pressureHpa: 1014.2,
    });
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[2]).toEqual({
      date: '2026-10-31',
      weatherCode: 61,
      temperatureMinC: 17,
      temperatureMaxC: 24,
      precipitationProbabilityPercent: 70,
    });
  });

  it('rejects when current or daily blocks are missing', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ timezone: 'America/Sao_Paulo', daily: { time: dates } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ timezone: 'America/Sao_Paulo', current: {} }),
      } as Response);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it('throws WeatherServiceError when Forecast returns a non-ok response', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 } as Response);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'api',
      status: 503,
    });
  });

  it('returns a friendly network error when Forecast is offline', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: 'Sem conexão. Verifique sua internet e tente novamente.',
    });
  });

  it('keeps five days and maps absent optional fields to null', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        current: {},
        daily: { time: dates },
      }),
    } as Response);

    const result = await getWeather(city);

    expect(result.current.temperatureC).toBeNull();
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]).toEqual({
      date: dates[0],
      weatherCode: null,
      temperatureMinC: null,
      temperatureMaxC: null,
      precipitationProbabilityPercent: null,
    });
  });

  it('maps null current precipitation to zero', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        current: { precipitation: null },
        daily: { time: dates },
      }),
    } as Response);

    const result = await getWeather(city);

    expect(result.current.precipitationMm).toBe(0);
    expect(result.forecast).toHaveLength(5);
  });

  it('rejects daily arrays with different lengths', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        current: {},
        daily: { time: dates, temperature_2m_min: [18, 19] },
      }),
    } as Response);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });
});

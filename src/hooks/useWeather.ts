import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: WeatherServiceError | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

type LastOperation = { kind: 'search'; name: string } | { kind: 'selectCity'; city: City };

interface ActiveRequest {
  id: number;
  controller: AbortController;
}

function toError(reason: unknown): WeatherServiceError {
  if (reason instanceof WeatherServiceError) return reason;
  if (reason instanceof Error && reason.name === 'AbortError') {
    return new WeatherServiceError('timeout', 'A requisição demorou demais. Tente novamente.');
  }
  if (reason instanceof TypeError) {
    return new WeatherServiceError(
      'network',
      'Sem conexão. Verifique sua internet e tente novamente.',
    );
  }
  return new WeatherServiceError(
    'invalid-response',
    'Não foi possível processar a resposta do serviço. Tente novamente.',
  );
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<WeatherServiceError | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const activeRequest = useRef<ActiveRequest | null>(null);
  const lastOperation = useRef<LastOperation | null>(null);

  function startRequest(): ActiveRequest {
    activeRequest.current?.controller.abort();
    const request = {
      id: requestId.current + 1,
      controller: new AbortController(),
    };
    requestId.current = request.id;
    activeRequest.current = request;
    return request;
  }

  function cancelActiveRequest() {
    requestId.current += 1;
    activeRequest.current?.controller.abort();
    activeRequest.current = null;
  }

  function isCurrentRequest(request: ActiveRequest): boolean {
    return requestId.current === request.id;
  }

  async function loadWeather(city: City, request: ActiveRequest): Promise<void> {
    try {
      const result = await getWeather(city, request.controller.signal);
      if (!isCurrentRequest(request)) return;

      setData(result);
      setError(null);
      setStatus('success');
    } catch (reason) {
      if (!isCurrentRequest(request) || request.controller.signal.aborted) return;

      setData(null);
      setError(toError(reason));
      setStatus('error');
    }
  }

  async function selectCity(city: City): Promise<void> {
    lastOperation.current = { kind: 'selectCity', city };
    setData(null);
    setError(null);
    setStatus('loading');

    const request = startRequest();
    await loadWeather(city, request);
  }

  async function search(name: string): Promise<void> {
    const trimmedName = name.trim();
    setQuery(trimmedName);

    if (trimmedName.length === 0) {
      cancelActiveRequest();
      lastOperation.current = null;
      setCities([]);
      setData(null);
      setError(null);
      setStatus('idle');
      return;
    }

    lastOperation.current = { kind: 'search', name: trimmedName };
    setCities([]);
    setData(null);
    setError(null);
    setStatus('loading');

    const request = startRequest();
    try {
      const results = await searchCities(trimmedName, request.controller.signal);
      if (!isCurrentRequest(request)) return;

      setCities(results);
      if (results.length === 0) {
        setData(null);
        setStatus('empty');
        return;
      }

      const firstCity = results[0];
      lastOperation.current = { kind: 'selectCity', city: firstCity };
      await loadWeather(firstCity, request);
    } catch (reason) {
      if (!isCurrentRequest(request) || request.controller.signal.aborted) return;

      setData(null);
      setError(toError(reason));
      setStatus('error');
    }
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (operation === null) return;

    if (operation.kind === 'search') {
      await search(operation.name);
      return;
    }

    await selectCity(operation.city);
  }

  useEffect(
    () => () => {
      requestId.current += 1;
      activeRequest.current?.controller.abort();
      activeRequest.current = null;
    },
    [],
  );

  return { status, data, cities, error, query, search, selectCity, retry };
}

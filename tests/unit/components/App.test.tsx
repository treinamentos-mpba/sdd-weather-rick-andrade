import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';
import { mockWeatherData } from '../../../src/mocks/weather';
import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

vi.mock('../../../src/services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/services/weatherService')>();
  return { ...actual, getWeather: vi.fn(), searchCities: vi.fn() };
});

const curitiba: City = {
  id: 2,
  name: 'Curitiba',
  admin1: 'Paraná',
  country: 'Brasil',
  latitude: -25.43,
  longitude: -49.27,
};

beforeEach(() => {
  vi.mocked(searchCities).mockReset();
  vi.mocked(getWeather).mockReset();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('App', () => {
  it('searches through the weather service and renders the result', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Clima', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Pesquise uma cidade');
    const searchbox = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(searchbox, 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(searchCities).toHaveBeenCalledWith('Campinas', expect.any(AbortSignal));
    expect(await screen.findByText('25 °C')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledWith(mockWeatherData.city, expect.any(AbortSignal));
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('marks the main region busy while searching and focuses results when complete', async () => {
    const user = userEvent.setup();
    const geocoding = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValue(geocoding.promise);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    const main = screen.getByRole('main');
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(main).toHaveAttribute('aria-busy', 'true');
    await act(async () => {
      geocoding.resolve([mockWeatherData.city]);
      await geocoding.promise;
    });

    expect(await screen.findByText('25 °C')).toBeInTheDocument();
    expect(main).toHaveAttribute('aria-busy', 'false');
    expect(main).toHaveFocus();
  });

  it('shows all geocoding candidates and lets the user select another city', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city, curitiba]);
    vi.mocked(getWeather)
      .mockResolvedValueOnce(mockWeatherData)
      .mockResolvedValueOnce({ ...mockWeatherData, city: curitiba });
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Cur');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByText('25 °C');

    await user.click(screen.getByRole('button', { name: 'Curitiba, Paraná, Brasil' }));

    expect(await screen.findByRole('heading', { name: 'Curitiba' })).toBeInTheDocument();
    expect(getWeather).toHaveBeenLastCalledWith(curitiba, expect.any(AbortSignal));
  });

  it('shows empty when geocoding returns no cities', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([]);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Cidade inexistente');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('Nenhuma cidade encontrada')).toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('shows service errors and retries the failed search', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities)
      .mockRejectedValueOnce(
        new WeatherServiceError(
          'network',
          'Sem conexão. Verifique sua internet e tente novamente.',
        ),
      )
      .mockResolvedValueOnce([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sem conexão. Verifique sua internet e tente novamente.',
    );

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('25 °C')).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(2);
  });

  it('keeps unit as UI state and converts rendered temperatures', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByText('25 °C');
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('78 °F')).toBeInTheDocument();
    expect(screen.getByText('81 °F')).toBeInTheDocument();
  });
});

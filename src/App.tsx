import { useEffect, useRef, useState } from 'react';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const { status, data, cities, error, query, search, selectCity, retry } = useWeather();
  const [unit, setUnit] = useState<Unit>('celsius');
  const mainRef = useRef<HTMLElement>(null);
  const handleSearch = (name: string) => void search(name);
  const handleRetry = () => void retry();
  const cityResults = cities.length > 0 && (
    <CityResults cities={cities} selectedCity={data?.city ?? null} onSelect={selectCity} />
  );

  useEffect(() => {
    if (status === 'success' || status === 'empty') {
      mainRef.current?.focus();
    }
  }, [status]);

  function renderWeatherState() {
    switch (status) {
      case 'idle':
        return (
          <EmptyState
            title="Pesquise uma cidade"
            hint="Busque uma cidade para consultar as condições e a previsão local."
          />
        );
      case 'loading':
        return (
          <div className="space-y-6">
            {cityResults}
            <LoadingState message="Consultando o clima..." />
          </div>
        );
      case 'empty':
        return (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint={`Não encontramos resultados para “${query}”. Confira o nome e tente novamente.`}
          />
        );
      case 'error':
        return (
          <div className="space-y-6">
            {cityResults}
            <ErrorState
              message={error?.message ?? 'Não foi possível consultar o clima.'}
              onRetry={handleRetry}
            />
          </div>
        );
      case 'success':
        if (data === null) return null;
        return (
          <div className="space-y-8">
            {cityResults}
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList days={data.forecast} unit={unit} />
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-900/80 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-xl border border-accent-400/30 bg-accent-500/15 text-xl text-sun"
            >
              ☀
            </span>
            <h1 className="text-lg font-semibold tracking-wide text-white">Clima</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-1 md:justify-end">
            <div className="w-full sm:min-w-72 sm:flex-1 md:max-w-xl">
              <SearchBar onSearch={handleSearch} />
            </div>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        ref={mainRef}
        tabIndex={-1}
        aria-busy={status === 'loading'}
        className="mx-auto w-full max-w-7xl rounded-xl px-4 py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 sm:px-6 sm:py-10"
      >
        {renderWeatherState()}
      </main>
    </div>
  );
}

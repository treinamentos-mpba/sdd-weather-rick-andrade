import { formatTemperature } from '../lib/temperature';
import { getWeatherDescription, getWeatherIcon } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

export interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | null, suffix: string): string {
  if (value === null) return 'Indisponível';
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)} ${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  if (current.temperatureC === null) {
    return (
      <section
        aria-labelledby="current-weather-city"
        className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-7"
      >
        <p className="text-sm font-medium text-slate-300">Clima atual</p>
        <h2 id="current-weather-city" className="mt-1 text-xl font-semibold text-white">
          {city.name}
        </h2>
        <p role="status" className="mt-5 text-sm text-slate-300">
          Clima atual indisponível
        </p>
      </section>
    );
  }

  const weatherDescription = getWeatherDescription(current.weatherCode);
  const weatherIcon = getWeatherIcon(current.weatherCode);
  const temperature = formatTemperature(current.temperatureC, unit);

  const metrics = [
    { label: 'Umidade', value: formatMetric(current.humidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, 'mm') },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, 'hPa') },
  ];

  return (
    <section
      aria-labelledby="current-weather-city"
      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-7"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">Clima atual</p>
          <h2 id="current-weather-city" className="mt-1 text-xl font-semibold text-white">
            {city.name}
          </h2>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          <span aria-hidden="true" className="text-5xl sm:text-6xl">
            {weatherIcon}
          </span>
          <div className="min-w-0">
            <p
              className={`break-words font-semibold leading-none text-white ${'text-5xl sm:text-6xl'}`}
            >
              {temperature}
            </p>
            <p className="mt-2 text-base text-slate-200">{weatherDescription}</p>
          </div>
        </div>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-xs font-medium text-slate-400">{metric.label}</dt>
            <dd className="mt-1 text-base font-semibold text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

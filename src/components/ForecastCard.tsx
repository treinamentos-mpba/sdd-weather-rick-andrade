import { formatDayLabel, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherDescription, getWeatherIcon } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

export interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
  index: number;
}

function formatProbability(value: number | null): string {
  if (value === null) return 'Indisponível';
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)}%`;
}

export default function ForecastCard({ day, unit, index }: ForecastCardProps) {
  return (
    <article className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md">
      <h3 className="text-sm font-semibold capitalize text-slate-100">
        {formatDayLabel(day.date, index)}
      </h3>
      <p className="mt-1 text-xs capitalize text-slate-400">{getShortDate(day.date)}</p>
      <div className="mt-3 flex items-center gap-2">
        <span aria-hidden="true" className="text-3xl">
          {getWeatherIcon(day.weatherCode)}
        </span>
        <p className="min-w-0 text-sm text-slate-300">{getWeatherDescription(day.weatherCode)}</p>
      </div>
      <dl className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <div className="min-w-0 flex-1">
          <dt className="text-xs text-slate-400">Máx.</dt>
          <dd className="break-words text-base font-semibold leading-tight text-white sm:text-lg">
            {formatTemperature(day.temperatureMaxC, unit)}
          </dd>
        </div>
        <div className="min-w-0 flex-1">
          <dt className="text-xs text-slate-400">Mín.</dt>
          <dd className="break-words text-sm leading-tight text-slate-400">
            {formatTemperature(day.temperatureMinC, unit)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-slate-400">
        Chuva{' '}
        <span className="font-medium text-slate-200">
          {formatProbability(day.precipitationProbabilityPercent)}
        </span>
      </p>
    </article>
  );
}

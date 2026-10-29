import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

export interface ForecastListProps {
  days: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ days, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-list-title">
      <h2 id="forecast-list-title" className="mb-4 text-lg font-semibold text-white">
        Previsão de 5 dias
      </h2>
      {days.length === 0 ? (
        <p className="text-sm text-slate-400">Previsão indisponível.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {days.map((day, index) => (
            <ForecastCard
              key={day.date ?? `forecast-day-${index}`}
              day={day}
              unit={unit}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}

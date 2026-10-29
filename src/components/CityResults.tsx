import type { City } from '../types/weather';

export interface CityResultsProps {
  cities: City[];
  selectedCity: City | null;
  onSelect: (city: City) => void;
}

function getCityLabel(city: City): string {
  return [city.name, city.admin1, city.country].filter(Boolean).join(', ');
}

export default function CityResults({ cities, selectedCity, onSelect }: CityResultsProps) {
  if (cities.length === 0) return null;

  return (
    <section aria-labelledby="city-results-title" className="space-y-3">
      <h2 id="city-results-title" className="text-sm font-semibold text-slate-200">
        Cidades encontradas
      </h2>
      <ul className="flex flex-wrap gap-2">
        {cities.map((city) => {
          const isSelected = selectedCity?.id === city.id;

          return (
            <li key={city.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(city)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
                  isSelected
                    ? 'border-accent-400/60 bg-accent-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                {getCityLabel(city)}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

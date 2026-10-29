import { type FormEvent, useId, useState } from 'react';

export interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const inputId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();
    if (disabled || trimmedCity.length === 0) return;

    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidade"
      onSubmit={handleSubmit}
      className="flex w-full items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-3 shadow-glass backdrop-blur-md sm:gap-4 sm:p-4"
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-100">
          Cidade
        </label>
        <input
          id={inputId}
          type="search"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Ex.: Campinas"
          disabled={disabled}
          className="w-full rounded-lg border border-white/10 bg-night-800/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="shrink-0 rounded-lg border border-accent-400/40 bg-accent-500 px-4 py-2.5 text-sm font-semibold text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent-500"
      >
        Buscar
      </button>
    </form>
  );
}

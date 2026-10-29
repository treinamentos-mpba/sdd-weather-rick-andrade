import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

export interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: Unit) {
    let next: Unit;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = current === 'celsius' ? 'fahrenheit' : 'celsius';
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = current === 'fahrenheit' ? 'celsius' : 'fahrenheit';
        break;
      case 'Home':
        next = 'celsius';
        break;
      case 'End':
        next = 'fahrenheit';
        break;
      default:
        return;
    }

    event.preventDefault();
    onChange(next);
    (next === 'celsius' ? celsiusButtonRef : fahrenheitButtonRef).current?.focus();
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex w-fit rounded-xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
    >
      <button
        ref={celsiusButtonRef}
        type="button"
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        tabIndex={unit === 'celsius' ? 0 : -1}
        onClick={() => onChange('celsius')}
        onKeyDown={(event) => handleKeyDown(event, 'celsius')}
        className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
          unit === 'celsius'
            ? 'bg-accent-500 text-night-900'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        °C
      </button>
      <button
        ref={fahrenheitButtonRef}
        type="button"
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        tabIndex={unit === 'fahrenheit' ? 0 : -1}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={(event) => handleKeyDown(event, 'fahrenheit')}
        className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
          unit === 'fahrenheit'
            ? 'bg-accent-500 text-night-900'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        °F
      </button>
    </div>
  );
}

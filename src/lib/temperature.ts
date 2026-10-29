import type { Unit } from '../types/weather';

export function convertTemperature(valueC: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (valueC * 9) / 5 + 32 : valueC;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(valueC: number | null, unit: Unit): string {
  if (valueC === null) return 'Indisponível';

  const roundedValue = Math.round(convertTemperature(valueC, unit));

  return `${roundedValue} ${unitLabel(unit)}`;
}

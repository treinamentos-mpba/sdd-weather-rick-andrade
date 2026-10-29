import { getWeatherDescription, getWeatherIcon } from '../../../src/lib/weatherCodes';

describe('weatherCodes', () => {
  it('maps a known weather code to its description and icon', () => {
    expect(getWeatherDescription(61)).toBe('Chuva fraca');
    expect(getWeatherIcon(61)).toBe('🌦️');
  });

  it('returns the fallback for unknown and missing codes', () => {
    expect(getWeatherDescription(999)).toBe('Condição indisponível');
    expect(getWeatherIcon(999)).toBe('—');
    expect(getWeatherDescription(null)).toBe('Condição indisponível');
    expect(getWeatherIcon(null)).toBe('—');
  });
});

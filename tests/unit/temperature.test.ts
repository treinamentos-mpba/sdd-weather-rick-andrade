import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converts %i °C to %i °F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('returns the original value for Celsius and converts for Fahrenheit', () => {
    expect(convertTemperature(21.5, 'celsius')).toBe(21.5);
    expect(convertTemperature(20, 'fahrenheit')).toBe(68);
  });
});

describe('formatTemperature', () => {
  it('rounds only for display and appends the active unit symbol', () => {
    expect(formatTemperature(23.6, 'celsius')).toBe('24 °C');
    expect(formatTemperature(20, 'fahrenheit')).toBe('68 °F');
    expect(formatTemperature(-10, 'fahrenheit')).toBe('14 °F');
    expect(formatTemperature(null, 'celsius')).toBe('Indisponível');
  });
});

describe('unitLabel', () => {
  it('returns the matching temperature symbol', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});

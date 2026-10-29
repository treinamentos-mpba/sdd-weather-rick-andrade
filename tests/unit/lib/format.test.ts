import { formatDayLabel, getShortDate } from '../../../src/lib/format';

describe('formatDayLabel', () => {
  it('labels forecast indices zero and one as today and tomorrow', () => {
    expect(formatDayLabel('2026-10-29', 0)).toBe('Hoje');
    expect(formatDayLabel('2026-10-30', 1)).toBe('Amanhã');
  });

  it('uses the weekday for the remaining forecast days', () => {
    expect(formatDayLabel('2026-11-01', 2)).toBe('domingo');
  });
});

describe('getShortDate', () => {
  it('formats an ISO local date with a short month name', () => {
    expect(getShortDate('2026-10-29')).toBe('29 de out.');
  });

  it('returns an unavailable label for invalid dates', () => {
    expect(getShortDate('2026-02-30')).toBe('Data indisponível');
    expect(getShortDate(null)).toBe('Data indisponível');
  });
});

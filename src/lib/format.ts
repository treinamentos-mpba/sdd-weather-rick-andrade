function parseLocalDate(date: string | null): Date | null {
  if (date === null) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;

  const [, year, month, day] = match;
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));
  if (
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() !== Number(month) - 1 ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return parsedDate;
}

export function formatDayLabel(date: string | null, index?: number): string {
  const parsedDate = parseLocalDate(date);
  if (parsedDate === null) return 'Data indisponível';
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(parsedDate);
}

export function getShortDate(date: string | null): string {
  const parsedDate = parseLocalDate(date);
  if (parsedDate === null) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(parsedDate);
}

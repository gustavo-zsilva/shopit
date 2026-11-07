export function formatBRL(value: number) {
  const safe = Number.isFinite(value) ? value : 0;
  const negative = safe < 0;
  const [whole, fraction] = Math.abs(safe).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negative ? '-' : ''}R$ ${grouped},${fraction}`;
}

export function formatPlain(value: number) {
  const safe = Number.isFinite(value) ? value : 0;
  const [whole, fraction] = Math.abs(safe).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped},${fraction}`;
}

export function parseMoney(input: string): number | null {
  let text = input.trim().replace(/\s/g, '').replace(/^r\$/i, '');
  if (!text || !/^[\d.,]+$/.test(text)) return null;

  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');

  if (lastComma >= 0 && lastDot >= 0) {
    text = lastComma > lastDot
      ? text.replace(/\./g, '').replace(',', '.')
      : text.replace(/,/g, '');
  } else if (lastComma >= 0) {
    const parts = text.split(',');
    text = parts.length === 2 && parts[1].length <= 2
      ? `${parts[0]}.${parts[1]}`
      : text.replace(/,/g, '');
  } else if ((text.match(/\./g) || []).length > 1) {
    text = text.replace(/\./g, '');
  } else if (lastDot >= 0) {
    const parts = text.split('.');
    if (parts[1].length > 2) text = text.replace(/\./g, '');
  }

  const value = Number(text);
  if (!Number.isFinite(value) || value < 0 || value > 999999.99) return null;
  return Math.round(value * 100) / 100;
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function formatDate(value: string) {
  const brazilian = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brazilian) {
    const month = MONTHS[Number(brazilian[2]) - 1];
    return month ? `${Number(brazilian[1])} ${month}` : value;
  }

  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  const date = new Date(time);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

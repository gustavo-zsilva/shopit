export type SpokenItem = {
  title: string;
  unities: number;
  note?: string;
};

export type SpokenRequest = {
  items: SpokenItem[];
  due?: Date;
};

const NUMBER_WORDS: Record<string, number> = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
};

const WEEKDAYS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

function fold(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tidyTitle(value: string) {
  const title = value
    .replace(/^(de|da|do|das|dos)\s+/i, '')
    .replace(/[.!?,]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!title) return '';
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function atHour(date: Date, hours: number) {
  const next = new Date(date);
  next.setHours(hours, 0, 0, 0);
  return next;
}

function nextWeekday(dayName: string, from = new Date()) {
  const target = WEEKDAYS.findIndex((day) => dayName.startsWith(day));
  const next = atHour(from, 9);
  if (target < 0) return next;
  let delta = (target - from.getDay() + 7) % 7;
  if (delta === 0 && from.getHours() >= 9) delta = 7;
  next.setDate(from.getDate() + delta);
  return next;
}

function extractDue(text: string, from = new Date()) {
  const match = text.match(/\bat[eé]\s+(hoje|amanh[aã]|segunda(?:-feira)?|ter[cç]a(?:-feira)?|quarta(?:-feira)?|quinta(?:-feira)?|sexta(?:-feira)?|s[aá]bado|domingo)\b/i);
  if (!match || match.index == null) return { rest: text, due: undefined as Date | undefined };

  const word = fold(match[1]).replace(/-feira/g, '').replace(/-/g, '');
  let due: Date;
  if (word === 'hoje') {
    due = atHour(from, 19);
    if (due.getTime() <= from.getTime()) due.setDate(due.getDate() + 1);
  } else if (word === 'amanha') {
    due = atHour(from, 9);
    due.setDate(due.getDate() + 1);
  } else {
    due = nextWeekday(word, from);
  }

  const rest = `${text.slice(0, match.index)} ${text.slice(match.index + match[0].length)}`.replace(/\s+,/g, ',').trim();
  return { rest, due };
}

function stripIntro(text: string) {
  return text
    .replace(/^(?:eu\s+)?(?:tenho|preciso|queria|quero|vamos)\s+(?:que\s+|q\s+)?(?:de\s+)?comprar\s+/i, '')
    .replace(/^comprar\s+/i, '')
    .trim();
}

function splitClauses(text: string) {
  return text
    .split(/\s*,\s*|\s+e\s+/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
}

const COUNT_UNIT = /^(cachos?|pacotes?|unidades?|latas?|caixas?|garrafas?|sacos?|bandejas?|d[uú]zias?)$/i;
const MEASURE: Record<string, string> = {
  g: 'g',
  grama: 'g',
  gramas: 'g',
  kg: 'kg',
  quilo: 'kg',
  quilos: 'kg',
  ml: 'ml',
  mililitro: 'ml',
  mililitros: 'ml',
  l: 'L',
  litro: 'L',
  litros: 'L',
};

function parseClause(raw: string): SpokenItem | null {
  const text = raw.replace(/[.!?]+$/g, '').trim();
  if (text.length < 2) return null;

  const amount = text.match(/^(?:(\d+(?:[.,]\d+)?)|(um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze))\s+(.+)$/i);
  if (!amount) {
    const title = tidyTitle(text);
    return title ? { title, unities: 1 } : null;
  }

  const quantity = amount[1]
    ? Number(amount[1].replace(',', '.'))
    : NUMBER_WORDS[fold(amount[2])] ?? 1;
  const tail = amount[3];
  const unitMatch = tail.match(/^([a-zà-ú]+)\s+(?:de\s+|da\s+|do\s+)?(.+)$/i);

  if (!unitMatch) {
    const title = tidyTitle(tail);
    return title ? { title, unities: Math.max(1, Math.round(quantity)) } : null;
  }

  const unit = unitMatch[1];
  const foldedUnit = fold(unit);
  const title = tidyTitle(unitMatch[2]);
  if (!title) return null;

  const measure = MEASURE[foldedUnit];
  if (measure) {
    const shown = Number.isInteger(quantity) ? String(quantity) : String(quantity).replace('.', ',');
    return { title, unities: 1, note: `${shown} ${measure}` };
  }

  if (COUNT_UNIT.test(unit)) {
    const count = Math.max(1, Math.round(quantity));
    return { title, unities: count, note: `${count} ${unit.toLowerCase()}` };
  }

  return { title: tidyTitle(tail), unities: Math.max(1, Math.round(quantity)) };
}

export function parseSpeech(input: string, from = new Date()): SpokenRequest {
  const { rest, due } = extractDue(stripIntro(input.trim()), from);
  const items = splitClauses(rest)
    .map(parseClause)
    .filter((item): item is SpokenItem => item !== null && item.title.length > 1);

  return { items, due };
}

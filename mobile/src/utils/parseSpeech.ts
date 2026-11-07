export type SpokenItem = {
  title: string;
  unities: number;
  note?: string;
  price?: number;
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
  const parts: string[] = [];
  let buf = '';
  let i = 0;

  const push = () => {
    const value = buf.replace(/\s+/g, ' ').trim();
    if (value.length > 1) parts.push(value);
    buf = '';
  };

  while (i < text.length) {
    const rest = text.slice(i);
    const comma = /^(\s*,\s*)/.exec(rest);
    if (comma) {
      const betweenDigits = /\d$/.test(buf) && /^\d/.test(text.slice(i + comma[0].length));
      if (betweenDigits) {
        buf += ',';
        i += comma[0].length;
        continue;
      }
      push();
      i += comma[0].length;
      continue;
    }

    const link = /^(\s+e\s+)/i.exec(rest);
    if (link) {
      const after = text.slice(i + link[0].length);
      const cents = /^\d{1,2}(?!\d)/.test(after);
      const measured = /^\d+\s+(?:g|kg|ml|l|gramas?|quilos?|litros?|mililitros?|pacotes?|unidades?|latas?|caixas?|garrafas?|sacos?|bandejas?|cachos?|d[uú]zias?)\b/i.test(after);
      const reais = /reais?$/i.test(buf.trim());
      if ((/\d$/.test(buf) || reais) && cents && !measured) {
        buf += ' e ';
        i += link[0].length;
        continue;
      }
      push();
      i += link[0].length;
      continue;
    }

    buf += text[i];
    i += 1;
  }

  push();
  return parts;
}

const PRICE_BODY = '(?:(?:a|por)\\s+)?(?:r\\$\\s*)?(\\d{1,6}(?:[.,]\\d{1,2})?)(?:\\s+reais)?(?:\\s+e\\s+(\\d{1,2})(?:\\s+centavos?)?)?(?:\\s+cada)?';
const PRICE_TAIL = new RegExp(`\\s+${PRICE_BODY}\\s*$`, 'i');
const PRICE_ONLY = new RegExp(`^${PRICE_BODY}$`, 'i');

function readPrice(match: RegExpMatchArray) {
  let value = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(value)) return null;
  if (match[2]) value = Math.trunc(value) + Number(match[2]) / 100;
  if (value <= 0 || value > 999999.99) return null;
  return Math.round(value * 100) / 100;
}

function priceSignaled(match: RegExpMatchArray) {
  return /[.,]\d/.test(match[1]) || /reais|cada|centavo|r\$/i.test(match[0]);
}

function takePrice(text: string) {
  const only = text.match(PRICE_ONLY);
  if (only && priceSignaled(only)) {
    const price = readPrice(only);
    if (price != null) return { text: '', price, only: true as const };
  }

  const tail = text.match(PRICE_TAIL);
  if (tail?.index != null && priceSignaled(tail)) {
    const price = readPrice(tail);
    const rest = text.slice(0, tail.index).trim();
    if (price != null && rest) return { text: rest, price, only: false as const };
  }

  return { text, price: undefined, only: false as const };
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

function parseClause(raw: string): SpokenItem | { price: number } | null {
  const cleaned = raw.replace(/[.!?]+$/g, '').trim();
  const priced = takePrice(cleaned);
  if (priced.only && priced.price != null) return { price: priced.price };

  const text = priced.text.replace(/[.!?]+$/g, '').trim();
  if (text.length < 2) return null;
  const item = parseProduct(text);
  if (!item) return null;
  if (priced.price != null) item.price = priced.price;
  return item;
}

const SKIP_TITLE = /^(cada|reais|real|centavo|centavos|rs)$/;

function parseProduct(text: string): SpokenItem | null {

  const amount = text.match(/^(?:(\d+(?:[.,]\d+)?)|(um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze))\s+(.+)$/i);
  if (!amount) {
    const title = tidyTitle(text);
    return title ? accept({ title, unities: 1 }) : null;
  }

  const quantity = amount[1]
    ? Number(amount[1].replace(',', '.'))
    : NUMBER_WORDS[fold(amount[2])] ?? 1;
  const tail = amount[3];
  const unitMatch = tail.match(/^([a-zà-ú]+)\s+(?:de\s+|da\s+|do\s+)?(.+)$/i);

  if (!unitMatch) {
    const title = tidyTitle(tail);
    return title ? accept({ title, unities: Math.max(1, Math.round(quantity)) }) : null;
  }

  const unit = unitMatch[1];
  const foldedUnit = fold(unit);
  const title = tidyTitle(unitMatch[2]);
  if (!title) return null;

  const measure = MEASURE[foldedUnit];
  if (measure) {
    const shown = Number.isInteger(quantity) ? String(quantity) : String(quantity).replace('.', ',');
    return accept({ title, unities: 1, note: `${shown} ${measure}` });
  }

  if (COUNT_UNIT.test(unit)) {
    const count = Math.max(1, Math.round(quantity));
    return accept({ title, unities: count, note: `${count} ${unit.toLowerCase()}` });
  }

  return accept({ title: tidyTitle(tail), unities: Math.max(1, Math.round(quantity)) });
}

function accept(item: SpokenItem) {
  const name = fold(item.title);
  if (SKIP_TITLE.test(name) || /^\d+(?:[.,]\d+)?$/.test(name)) return null;
  return item;
}

export function parseSpeech(input: string, from = new Date()): SpokenRequest {
  const { rest, due } = extractDue(stripIntro(input.trim()), from);
  const items: SpokenItem[] = [];
  for (const clause of splitClauses(rest)) {
    const parsed = parseClause(clause);
    if (!parsed) continue;
    if ('title' in parsed) {
      if (parsed.title.length > 1) items.push(parsed);
      continue;
    }
    const previous = items[items.length - 1];
    if (previous && previous.price == null) previous.price = parsed.price;
  }

  return { items, due };
}

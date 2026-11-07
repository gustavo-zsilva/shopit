import { parseMoney } from './format';

export type ParsedCode = {
  title?: string;
  price?: number;
  barcode?: string;
  raw: string;
};

const NAME_KEYS = ['nome', 'name', 'produto', 'product', 'title', 'descricao', 'description', 'item', 'desc'];
const PRICE_KEYS = ['preco', 'price', 'valor', 'value', 'vlr', 'vl'];
const CODE_KEYS = ['ean', 'gtin', 'barcode', 'codigo', 'code', 'sku'];

function fold(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isBarcode(value: string) {
  return /^\d{8,14}$/.test(value.trim());
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(obj: Record<string, unknown>, keys: string[]) {
  const wanted = new Set(keys.map(fold));
  for (const [key, value] of Object.entries(obj)) {
    if (!wanted.has(fold(key)) || typeof value !== 'string') continue;
    const title = value.trim();
    if (title) return title.slice(0, 48);
  }
  return undefined;
}

function pickMoney(obj: Record<string, unknown>, keys: string[]) {
  const wanted = new Set(keys.map(fold));
  for (const [key, value] of Object.entries(obj)) {
    if (!wanted.has(fold(key))) continue;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 999999.99) {
      return Math.round(value * 100) / 100;
    }
    if (typeof value === 'string') {
      const price = parseMoney(value);
      if (price != null) return price;
    }
  }
  return undefined;
}

function pickBarcode(obj: Record<string, unknown>, keys: string[]) {
  const wanted = new Set(keys.map(fold));
  for (const [key, value] of Object.entries(obj)) {
    if (!wanted.has(fold(key))) continue;
    const code = String(value).trim();
    if (isBarcode(code)) return code;
  }
  return undefined;
}

function fromJson(text: string): Omit<ParsedCode, 'raw'> | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;

  let data: unknown;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }

  const root = asRecord(data);
  if (!root) return null;

  const layers = [root];
  for (const value of Object.values(root)) {
    const nested = asRecord(value);
    if (nested) layers.push(nested);
  }

  let title: string | undefined;
  let price: number | undefined;
  let barcode: string | undefined;

  for (const layer of layers) {
    title = title || pickString(layer, NAME_KEYS);
    if (price == null) price = pickMoney(layer, PRICE_KEYS);
    barcode = barcode || pickBarcode(layer, CODE_KEYS);
  }

  if (!title && price == null && !barcode) return null;
  return { title, price, barcode };
}

function firstParam(params: URLSearchParams, keys: string[]) {
  const wanted = new Set(keys.map(fold));
  for (const [key, value] of params.entries()) {
    if (wanted.has(fold(key)) && value.trim()) return value.trim();
  }
  return undefined;
}

function fromUrl(text: string): Omit<ParsedCode, 'raw'> | null {
  if (!/^https?:\/\//i.test(text)) return null;

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }

  const title = firstParam(url.searchParams, NAME_KEYS)?.slice(0, 48);
  const priceRaw = firstParam(url.searchParams, PRICE_KEYS);
  const price = priceRaw ? parseMoney(priceRaw) ?? undefined : undefined;
  const barcodeRaw = firstParam(url.searchParams, CODE_KEYS);
  const barcode = barcodeRaw && isBarcode(barcodeRaw) ? barcodeRaw : undefined;

  if (!title && price == null && !barcode) return null;
  return { title, price, barcode };
}

function fromPair(text: string): Omit<ParsedCode, 'raw'> | null {
  const chunks = text.split(/\s*[|;]\s*/).map((part) => part.trim()).filter(Boolean);

  if (chunks.length >= 2) {
    const price = parseMoney(chunks[chunks.length - 1].replace(/^r\$\s*/i, ''));
    if (price != null) {
      const head = chunks.slice(0, -1);
      const barcode = head.find(isBarcode);
      const title = head.filter((part) => !isBarcode(part)).join(' ').trim();
      if (title || barcode) {
        return {
          title: title ? title.slice(0, 48) : undefined,
          price,
          barcode,
        };
      }
    }
  }

  const match = text.match(/^(.+?)\s+(?:[-–—]\s*)?R\$\s*(\d[\d.,]*)$/i);
  if (!match) return null;

  const price = parseMoney(match[2]);
  const title = match[1].replace(/[-–—]\s*$/, '').trim();
  if (price == null || !title) return null;
  return { title: title.slice(0, 48), price };
}

export function parseScan(raw: string): ParsedCode {
  const text = raw.trim();
  if (!text) return { raw: text };

  const json = fromJson(text);
  if (json) return { raw: text, ...json };

  const url = fromUrl(text);
  if (url) return { raw: text, ...url };

  const pair = fromPair(text);
  if (pair) return { raw: text, ...pair };

  if (isBarcode(text)) return { raw: text, barcode: text };

  if (/^r?\$?\s*\d[\d.,]*$/i.test(text)) {
    const price = parseMoney(text.replace(/^r\$\s*/i, ''));
    if (price != null) return { raw: text, price };
  }

  if (text.length <= 48 && !/https?:\/\//i.test(text) && /[a-zà-ú]/i.test(text)) {
    return { raw: text, title: text };
  }

  return { raw: text };
}

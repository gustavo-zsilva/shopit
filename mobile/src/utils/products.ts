import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'priceBook';

export type PriceMemory = {
  title: string;
  price: number;
  store?: string;
};

type Book = Record<string, PriceMemory>;

function nameKey(title: string) {
  return `name:${title.trim().toLocaleLowerCase().replace(/\s+/g, ' ')}`;
}

async function readBook(): Promise<Book> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Book;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function rememberPrice(barcode: string | undefined, title: string, price: number, store?: string) {
  const cleanTitle = title.trim();
  if (!cleanTitle || !(price > 0)) return;

  const book = await readBook();
  const entry = { title: cleanTitle, price, store: store?.trim() || undefined };
  if (barcode) book[`code:${barcode}`] = entry;
  book[nameKey(cleanTitle)] = entry;
  await AsyncStorage.setItem(KEY, JSON.stringify(book));
}

export async function recallPrice(barcode?: string, title?: string) {
  const book = await readBook();
  if (barcode && book[`code:${barcode}`]) return book[`code:${barcode}`];
  if (title?.trim() && book[nameKey(title)]) return book[nameKey(title)];
  return null;
}

export async function lookupProduct(barcode: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,product_name_pt,generic_name_pt,abbreviated_product_name`,
      {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Shopit/2.0 (personal shopping list)',
        },
      },
    );

    if (!response.ok) return null;
    const body = await response.json();
    const product = body?.product as Record<string, unknown> | undefined;
    const name = product?.product_name_pt
      || product?.product_name
      || product?.abbreviated_product_name
      || product?.generic_name_pt;

    return typeof name === 'string' && name.trim() ? name.trim().slice(0, 48) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

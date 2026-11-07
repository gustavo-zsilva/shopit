import { parseMoney } from './format';

export function extractPrice(text: string) {
  const labeled = text.match(/R\$\s*(\d{1,4}(?:[.,]\d{2})?)/i);
  if (labeled) {
    const price = parseMoney(labeled[1]);
    if (price != null && price > 0) return price;
  }

  const plain = [...text.matchAll(/(?:^|[^\d])(\d{1,4}[.,]\d{2})(?!\d)/g)];
  for (const match of plain) {
    const price = parseMoney(match[1]);
    if (price != null && price > 0 && price < 10000) return price;
  }

  return null;
}

export async function readPrintedPrice(uri: string): Promise<number | null | 'unavailable'> {
  try {
    const kit = await import('expo-ocr-kit');
    const result = await kit.recognizeText(uri);
    return extractPrice(result.text ?? '');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/native module|cannot find|expo-ocr-kit/i.test(message)) return 'unavailable';
    return null;
  }
}

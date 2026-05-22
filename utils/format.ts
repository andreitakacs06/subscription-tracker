import { CURRENCIES } from '@/constants/currencies';

const SYMBOLS: Record<string, string> = CURRENCIES.reduce((acc, c) => {
  acc[c.code] = c.symbol;
  return acc;
}, {} as Record<string, string>);

export function formatCurrency(amount: number, currency = 'USD'): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    const symbol = SYMBOLS[currency] ?? '';
    return `${symbol}${safe.toFixed(2)}`;
  }
}

export function formatCompact(amount: number, currency = 'USD'): string {
  const symbol = SYMBOLS[currency] ?? '$';
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}k`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

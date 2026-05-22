import {
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  format,
  formatISO,
  isBefore,
  parseISO,
  startOfDay,
} from 'date-fns';
import { Subscription, BillingCycle } from '@/types';

export function toMonthly(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return price * 4.345;
    case 'yearly':
      return price / 12;
    case 'monthly':
    default:
      return price;
  }
}

export function toYearly(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return price * 52;
    case 'monthly':
      return price * 12;
    case 'yearly':
    default:
      return price;
  }
}

export function advanceByCycle(date: Date, cycle: BillingCycle): Date {
  switch (cycle) {
    case 'weekly':
      return addWeeks(date, 1);
    case 'yearly':
      return addYears(date, 1);
    case 'monthly':
    default:
      return addMonths(date, 1);
  }
}

export function rollForwardRenewal(iso: string, cycle: BillingCycle): string {
  const today = startOfDay(new Date());
  let date: Date;
  try {
    date = parseISO(iso);
  } catch {
    return iso;
  }
  if (!isBefore(date, today)) return iso;

  let safety = 0;
  while (isBefore(date, today) && safety < 1000) {
    date = advanceByCycle(date, cycle);
    safety += 1;
  }
  return formatISO(date);
}

export function autoAdvanceRenewals(subs: Subscription[]): {
  next: Subscription[];
  changed: boolean;
  changedIds: string[];
} {
  const changedIds: string[] = [];
  const next = subs.map((s) => {
    const rolled = rollForwardRenewal(s.renewalDate, s.cycle);
    if (rolled === s.renewalDate) return s;
    changedIds.push(s.id);
    return { ...s, renewalDate: rolled };
  });
  return { next, changed: changedIds.length > 0, changedIds };
}

export interface Totals {
  monthly: number;
  yearly: number;
  count: number;
}

export function computeTotals(subs: Subscription[]): Totals {
  return subs.reduce<Totals>(
    (acc, s) => {
      acc.monthly += toMonthly(s.price, s.cycle);
      acc.yearly += toYearly(s.price, s.cycle);
      acc.count += 1;
      return acc;
    },
    { monthly: 0, yearly: 0, count: 0 },
  );
}

export function spendingByCategory(subs: Subscription[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const s of subs) {
    map[s.category] = (map[s.category] ?? 0) + toMonthly(s.price, s.cycle);
  }
  return map;
}

export interface UpcomingItem {
  sub: Subscription;
  daysUntil: number;
  label: string;
}

export function getUpcoming(subs: Subscription[], limit = 5): UpcomingItem[] {
  const now = new Date();
  return subs
    .map((sub) => {
      const date = parseISO(sub.renewalDate);
      const days = differenceInCalendarDays(date, now);
      const label =
        days < 0
          ? `${Math.abs(days)}d overdue`
          : days === 0
          ? 'Today'
          : days === 1
          ? 'Tomorrow'
          : `In ${days} days`;
      return { sub, daysUntil: days, label };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, limit);
}

export function formatRenewalShort(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d');
  } catch {
    return iso;
  }
}

export function groupByRenewalDay(subs: Subscription[]): Record<string, Subscription[]> {
  const map: Record<string, Subscription[]> = {};
  for (const s of subs) {
    const key = s.renewalDate.slice(0, 10);
    if (!map[key]) map[key] = [];
    map[key].push(s);
  }
  return map;
}

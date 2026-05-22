export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
  icon: string;
  builtin?: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  cycle: BillingCycle;
  renewalDate: string;
  category: CategoryId;
  color?: string;
  icon?: string;
  note?: string;
  createdAt: string;
  notificationId?: string | null;
}

export interface Settings {
  currency: string;
  darkMode: boolean;
  notifications: boolean;
  notificationLeadDays: number;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Settings, Subscription } from '@/types';

const KEYS = {
  subs: 'subtrack:subscriptions:v1',
  settings: 'subtrack:settings:v1',
  categories: 'subtrack:categories:v1',
  monthlyHistory: 'subtrack:monthly-history:v1',
} as const;

async function readJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.warn(`[storage] failed to read ${key}`, e);
    return null;
  }
}

async function writeJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[storage] failed to write ${key}`, e);
  }
}

export type MonthlyHistory = Record<string, number>;

export const storage = {
  loadSubscriptions: () => readJSON<Subscription[]>(KEYS.subs),
  saveSubscriptions: (subs: Subscription[]) => writeJSON(KEYS.subs, subs),
  loadSettings: () => readJSON<Settings>(KEYS.settings),
  saveSettings: (settings: Settings) => writeJSON(KEYS.settings, settings),
  loadCategories: () => readJSON<Category[]>(KEYS.categories),
  saveCategories: (cats: Category[]) => writeJSON(KEYS.categories, cats),
  loadMonthlyHistory: () => readJSON<MonthlyHistory>(KEYS.monthlyHistory),
  saveMonthlyHistory: (h: MonthlyHistory) => writeJSON(KEYS.monthlyHistory, h),
  reset: async () => {
    await AsyncStorage.multiRemove([
      KEYS.subs,
      KEYS.settings,
      KEYS.categories,
      KEYS.monthlyHistory,
    ]);
  },
};

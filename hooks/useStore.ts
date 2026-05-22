import { create } from 'zustand';
import { Category, Settings, Subscription } from '@/types';
import { storage, MonthlyHistory } from '@/storage';
import { convertCurrency } from '@/constants/currencies';
import {
  BUILTIN_CATEGORIES,
  makeCategoryId,
} from '@/constants/categories';
import { autoAdvanceRenewals, toMonthly } from '@/utils/subscriptions';
import {
  cancelNotification,
  rescheduleReminder,
} from '@/utils/notifications';
import { format } from 'date-fns';

const DEFAULT_SETTINGS: Settings = {
  currency: 'USD',
  darkMode: true,
  notifications: true,
  notificationLeadDays: 2,
};

function currentMonthKey(): string {
  return format(new Date(), 'yyyy-MM');
}

function snapshotMonth(
  subs: Subscription[],
  history: MonthlyHistory,
): MonthlyHistory {
  const key = currentMonthKey();
  const total = subs.reduce((sum, s) => sum + toMonthly(s.price, s.cycle), 0);
  return { ...history, [key]: Math.round(total * 100) / 100 };
}

interface Store {
  subscriptions: Subscription[];
  settings: Settings;
  categories: Category[];
  monthlyHistory: MonthlyHistory;
  hydrated: boolean;

  hydrate: () => Promise<void>;

  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt'>) => Promise<void>;
  updateSubscription: (id: string, patch: Partial<Subscription>) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;

  addCategory: (cat: Omit<Category, 'id' | 'builtin'>) => Promise<Category>;
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;

  setSettings: (patch: Partial<Settings>) => Promise<void>;

  advanceStaleRenewals: () => Promise<void>;

  resetAll: () => Promise<void>;
}

export const useStore = create<Store>()((set, get) => ({
  subscriptions: [],
  settings: DEFAULT_SETTINGS,
  categories: BUILTIN_CATEGORIES,
  monthlyHistory: {},
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;

    const [storedSubs, storedSettings, storedCats, storedHistory] =
      await Promise.all([
        storage.loadSubscriptions(),
        storage.loadSettings(),
        storage.loadCategories(),
        storage.loadMonthlyHistory(),
      ]);

    const customCats = storedCats?.filter((c) => !c.builtin) ?? [];
    const categories = [...BUILTIN_CATEGORIES, ...customCats];

    const settings = { ...DEFAULT_SETTINGS, ...(storedSettings ?? {}) };

    const subs = storedSubs ?? [];
    const history = storedHistory ?? {};

    const updatedHistory = snapshotMonth(subs, history);
    if (updatedHistory[currentMonthKey()] !== history[currentMonthKey()]) {
      await storage.saveMonthlyHistory(updatedHistory);
    }

    set({
      subscriptions: subs,
      settings,
      categories,
      monthlyHistory: updatedHistory,
      hydrated: true,
    });
  },

  addSubscription: async (sub) => {
    const newSub: Subscription = {
      ...sub,
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      notificationId: null,
    };

    const settings = get().settings;
    const notificationId = await rescheduleReminder(
      newSub,
      settings.notificationLeadDays,
      settings.notifications,
    );
    newSub.notificationId = notificationId;

    const next = [newSub, ...get().subscriptions];
    const nextHistory = snapshotMonth(next, get().monthlyHistory);

    set({ subscriptions: next, monthlyHistory: nextHistory });
    await Promise.all([
      storage.saveSubscriptions(next),
      storage.saveMonthlyHistory(nextHistory),
    ]);
  },

  updateSubscription: async (id, patch) => {
    const prev = get().subscriptions.find((s) => s.id === id);
    if (!prev) return;

    const merged: Subscription = { ...prev, ...patch };

    const reminderFieldChanged =
      patch.renewalDate !== undefined ||
      patch.cycle !== undefined ||
      patch.name !== undefined ||
      patch.price !== undefined ||
      patch.currency !== undefined;

    if (reminderFieldChanged) {
      const settings = get().settings;
      merged.notificationId = await rescheduleReminder(
        merged,
        settings.notificationLeadDays,
        settings.notifications,
      );
    }

    const next = get().subscriptions.map((s) => (s.id === id ? merged : s));
    const nextHistory = snapshotMonth(next, get().monthlyHistory);

    set({ subscriptions: next, monthlyHistory: nextHistory });
    await Promise.all([
      storage.saveSubscriptions(next),
      storage.saveMonthlyHistory(nextHistory),
    ]);
  },

  removeSubscription: async (id) => {
    const sub = get().subscriptions.find((s) => s.id === id);
    if (sub) await cancelNotification(sub.notificationId);

    const next = get().subscriptions.filter((s) => s.id !== id);
    const nextHistory = snapshotMonth(next, get().monthlyHistory);

    set({ subscriptions: next, monthlyHistory: nextHistory });
    await Promise.all([
      storage.saveSubscriptions(next),
      storage.saveMonthlyHistory(nextHistory),
    ]);
  },

  addCategory: async ({ name, color, icon }) => {
    const newCat: Category = {
      id: makeCategoryId(),
      name: name.trim(),
      color,
      icon,
      builtin: false,
    };
    const next = [...get().categories, newCat];
    set({ categories: next });
    await storage.saveCategories(next.filter((c) => !c.builtin));
    return newCat;
  },

  updateCategory: async (id, patch) => {
    const next = get().categories.map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    );
    set({ categories: next });
    await storage.saveCategories(next.filter((c) => !c.builtin));
  },

  removeCategory: async (id) => {
    const target = get().categories.find((c) => c.id === id);
    if (!target || target.builtin) return;

    const subs = get().subscriptions.map((s) =>
      s.category === id ? { ...s, category: 'other' } : s,
    );
    const cats = get().categories.filter((c) => c.id !== id);
    set({ subscriptions: subs, categories: cats });
    await Promise.all([
      storage.saveSubscriptions(subs),
      storage.saveCategories(cats.filter((c) => !c.builtin)),
    ]);
  },

  setSettings: async (patch) => {
    const prev = get().settings;
    const next = { ...prev, ...patch };

    let nextSubs = get().subscriptions;
    if (patch.currency && patch.currency !== prev.currency) {
      nextSubs = nextSubs.map((s) => ({
        ...s,
        price: roundMoney(convertCurrency(s.price, s.currency, patch.currency!)),
        currency: patch.currency!,
      }));
      set({ subscriptions: nextSubs });
      await storage.saveSubscriptions(nextSubs);
    }

    set({ settings: next });
    await storage.saveSettings(next);

    const notificationsChanged =
      patch.notifications !== undefined ||
      patch.notificationLeadDays !== undefined;
    if (notificationsChanged) {
      const refreshed: Subscription[] = [];
      for (const s of nextSubs) {
        const notificationId = await rescheduleReminder(
          s,
          next.notificationLeadDays,
          next.notifications,
        );
        refreshed.push({ ...s, notificationId });
      }
      set({ subscriptions: refreshed });
      await storage.saveSubscriptions(refreshed);
    }
  },

  advanceStaleRenewals: async () => {
    const subs = get().subscriptions;
    const { next, changed, changedIds } = autoAdvanceRenewals(subs);
    if (!changed) return;

    const settings = get().settings;
    const updated: Subscription[] = [];
    for (const s of next) {
      if (changedIds.includes(s.id)) {
        const notificationId = await rescheduleReminder(
          s,
          settings.notificationLeadDays,
          settings.notifications,
        );
        updated.push({ ...s, notificationId });
      } else {
        updated.push(s);
      }
    }
    set({ subscriptions: updated });
    await storage.saveSubscriptions(updated);
  },

  resetAll: async () => {
    for (const s of get().subscriptions) {
      await cancelNotification(s.notificationId);
    }
    await storage.reset();
    set({
      subscriptions: [],
      settings: DEFAULT_SETTINGS,
      categories: BUILTIN_CATEGORIES,
      monthlyHistory: {},
      hydrated: true,
    });
  },
}));

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

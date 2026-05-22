import { Category, CategoryId } from '@/types';

export const BUILTIN_CATEGORIES: Category[] = [
  { id: 'entertainment', name: 'Entertainment', color: '#F43F5E', icon: 'film-outline', builtin: true },
  { id: 'music', name: 'Music', color: '#22D3EE', icon: 'musical-notes-outline', builtin: true },
  { id: 'productivity', name: 'Productivity', color: '#7C5CFF', icon: 'briefcase-outline', builtin: true },
  { id: 'fitness', name: 'Fitness', color: '#34D399', icon: 'barbell-outline', builtin: true },
  { id: 'cloud', name: 'Cloud', color: '#60A5FA', icon: 'cloud-outline', builtin: true },
  { id: 'news', name: 'News', color: '#F59E0B', icon: 'newspaper-outline', builtin: true },
  { id: 'gaming', name: 'Gaming', color: '#A78BFA', icon: 'game-controller-outline', builtin: true },
  { id: 'education', name: 'Education', color: '#10B981', icon: 'school-outline', builtin: true },
  { id: 'shopping', name: 'Shopping', color: '#EC4899', icon: 'cart-outline', builtin: true },
  { id: 'other', name: 'Other', color: '#94A3B8', icon: 'apps-outline', builtin: true },
];

export const CATEGORY_ICON_CHOICES: string[] = [
  'film-outline',
  'musical-notes-outline',
  'briefcase-outline',
  'barbell-outline',
  'cloud-outline',
  'newspaper-outline',
  'game-controller-outline',
  'school-outline',
  'cart-outline',
  'apps-outline',
  'pizza-outline',
  'cafe-outline',
  'car-outline',
  'home-outline',
  'heart-outline',
  'paw-outline',
  'flask-outline',
  'planet-outline',
  'rocket-outline',
  'shield-checkmark-outline',
  'wallet-outline',
  'gift-outline',
  'happy-outline',
  'medical-outline',
];

export const CATEGORY_COLOR_CHOICES: string[] = [
  '#F43F5E',
  '#FB7185',
  '#F59E0B',
  '#FBBF24',
  '#10B981',
  '#34D399',
  '#22D3EE',
  '#60A5FA',
  '#7DD3FC',
  '#A78BFA',
  '#7C5CFF',
  '#EC4899',
  '#94A3B8',
  '#F472B6',
];

export const resolveCategory = (
  id: CategoryId,
  all: Category[],
): Category =>
  all.find((c) => c.id === id) ??
  BUILTIN_CATEGORIES.find((c) => c.id === 'other')!;

export function makeCategoryId(): CategoryId {
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

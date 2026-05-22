import { useStore } from '@/hooks/useStore';
import { resolveCategory } from '@/constants/categories';
import { Category, CategoryId } from '@/types';

export function useCategories(): Category[] {
  return useStore((s) => s.categories);
}

export function useCategoryResolver(): (id: CategoryId) => Category {
  const categories = useStore((s) => s.categories);
  return (id: CategoryId) => resolveCategory(id, categories);
}

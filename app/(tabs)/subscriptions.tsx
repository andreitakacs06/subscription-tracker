import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { CategoryChip } from '@/components/CategoryChip';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { useStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { useCategories } from '@/hooks/useCategories';
import { CategoryId } from '@/types';
import { spacing } from '@/constants/theme';

/**
 * Subscriptions tab: searchable, filterable list of all subscriptions.
 */
export default function SubscriptionsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const subs = useStore((s) => s.subscriptions);
  const categories = useCategories();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subs.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.note?.toLowerCase().includes(q);
      const matchesCat = filter === 'all' || s.category === filter;
      return matchesQuery && matchesCat;
    });
  }, [subs, query, filter]);

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <View style={styles.header}>
          <View>
            <Text variant="caption" muted>
              YOUR LIBRARY
            </Text>
            <Text variant="title">Subscriptions</Text>
          </View>
          <Pressable
            onPress={() => router.push('/add')}
            style={[styles.addBtn, { backgroundColor: theme.accent }]}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        </View>

        <TextField
          icon="search"
          placeholder="Search subscriptions"
          value={query}
          onChangeText={setQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          <CategoryChip
            label="All"
            icon="apps"
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              icon={c.icon as any}
              color={c.color}
              active={filter === c.id}
              onPress={() => setFilter(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No matches"
          subtitle={
            subs.length === 0
              ? 'Add your first subscription to start tracking.'
              : 'Try a different search or category.'
          }
          action={
            subs.length === 0 ? (
              <Button
                icon="add"
                label="Add subscription"
                onPress={() => router.push('/add')}
              />
            ) : null
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.xxxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((sub, i) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              index={i}
              onPress={() =>
                router.push({ pathname: '/subscription/[id]', params: { id: sub.id } })
              }
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

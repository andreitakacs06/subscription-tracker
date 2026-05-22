import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { IconBadge } from '@/components/IconBadge';
import { DonutChart, DonutSlice } from '@/components/DonutChart';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { DashboardWidget } from '@/components/DashboardWidget';
import { useStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { useCategories, useCategoryResolver } from '@/hooks/useCategories';
import { computeTotals, getUpcoming, spendingByCategory } from '@/utils/subscriptions';
import { formatCompact, formatCurrency } from '@/utils/format';
import { spacing } from '@/constants/theme';

/**
 * Dashboard screen.
 * Aggregates totals, surfaces upcoming renewals, and visualizes spending
 * distribution by category.
 */
export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const subs = useStore((s) => s.subscriptions);
  const currency = useStore((s) => s.settings.currency);
  const categories = useCategories();
  const resolveCat = useCategoryResolver();

  const totals = useMemo(() => computeTotals(subs), [subs]);
  const upcoming = useMemo(() => getUpcoming(subs, 4), [subs]);
  const byCat = useMemo(() => spendingByCategory(subs), [subs]);

  const slices: DonutSlice[] = useMemo(() => {
    return categories
      .map((c) => ({
        label: c.name,
        color: c.color,
        value: byCat[c.id] ?? 0,
      }))
      .filter((s) => s.value > 0);
  }, [byCat, categories]);

  if (subs.length === 0) {
    return (
      <Screen>
        <Header />
        <EmptyState
          icon="rocket-outline"
          title="Track your first subscription"
          subtitle="Get a clear view of where your money goes every month."
          action={
            <Button
              icon="add"
              label="Add subscription"
              onPress={() => router.push('/add')}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header />

      {/* Hero widget — same shape as a 4×3 home-screen widget */}
      <DashboardWidget />

      <View style={[styles.statRow, { marginTop: spacing.lg }]}>
        <StatCard
          label="Active"
          value={String(totals.count)}
          icon="checkmark-circle-outline"
          delay={120}
        />
        <View style={{ width: spacing.md }} />
        <StatCard
          label="Categories"
          value={String(slices.length)}
          icon="grid-outline"
          delay={180}
        />
      </View>

      {slices.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <SectionHeader title="Spending by category" />
          <Card>
            <View style={styles.donutRow}>
              <DonutChart
                data={slices}
                size={170}
                centerValue={formatCompact(totals.monthly, currency)}
                centerLabel="per month"
              />
              <View style={styles.legend}>
                {slices.slice(0, 5).map((s) => (
                  <View key={s.label} style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: s.color }]}
                    />
                    <Text variant="bodySm" muted style={{ flex: 1 }}>
                      {s.label}
                    </Text>
                    <Text variant="bodySm" weight="600">
                      {formatCurrency(s.value, currency)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </Animated.View>
      ) : null}

      <SectionHeader
        title="Upcoming renewals"
        actionLabel="See all"
        onAction={() => router.push('/(tabs)/subscriptions')}
      />

      {upcoming.map((u, i) => {
        const cat = resolveCat(u.sub.category);
        const accent = u.sub.color ?? cat.color;
        return (
          <Animated.View
            key={u.sub.id}
            entering={FadeIn.delay(300 + i * 60)}
          >
            <Pressable
              onPress={() =>
                router.push({ pathname: '/subscription/[id]', params: { id: u.sub.id } })
              }
            >
              <Card style={{ marginBottom: spacing.sm }}>
                <View style={styles.upRow}>
                  <IconBadge
                    icon={(u.sub.icon as any) ?? cat.icon}
                    color={accent}
                    size={40}
                  />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text variant="h3">{u.sub.name}</Text>
                    <Text variant="bodySm" muted>
                      {u.label}
                    </Text>
                  </View>
                  <Text variant="h3">
                    {formatCurrency(u.sub.price, u.sub.currency)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          </Animated.View>
        );
      })}

      <Button
        icon="add"
        label="Add subscription"
        onPress={() => router.push('/add')}
        style={{ marginTop: spacing.xl }}
      />
    </Screen>
  );
}

/** Header band shown at the top of the dashboard. */
const Header: React.FC = () => {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <View>
        <Text variant="caption" muted>
          WELCOME BACK
        </Text>
        <Text variant="title">Subtrack</Text>
      </View>
      <View
        style={[
          styles.avatar,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Ionicons name="sparkles" size={18} color={theme.accent} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statRow: { flexDirection: 'row' },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legend: { flex: 1, marginLeft: spacing.lg },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  upRow: { flexDirection: 'row', alignItems: 'center' },
});

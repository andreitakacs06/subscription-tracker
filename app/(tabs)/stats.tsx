import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { subMonths, format } from 'date-fns';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { BarChart, BarDatum } from '@/components/BarChart';
import { DonutChart, DonutSlice } from '@/components/DonutChart';
import { IconBadge } from '@/components/IconBadge';
import { EmptyState } from '@/components/EmptyState';
import { useStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import {
  computeTotals,
  spendingByCategory,
  toMonthly,
  toYearly,
} from '@/utils/subscriptions';
import { formatCompact, formatCurrency } from '@/utils/format';
import { useCategories, useCategoryResolver } from '@/hooks/useCategories';
import { spacing } from '@/constants/theme';

function buildMonthlyBars(
  history: Record<string, number>,
  currentTotal: number,
  months = 12,
): BarDatum[] {
  const now = new Date();
  const currentKey = format(now, 'yyyy-MM');

  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(now, months - 1 - i);
    const key = format(date, 'yyyy-MM');
    const isCurrent = key === currentKey;
    const value = isCurrent ? currentTotal : (history[key] ?? 0);
    return {
      label: format(date, 'MMM').slice(0, 1),
      value,
    };
  });
}

export default function StatsScreen() {
  const theme = useTheme();
  const subs = useStore((s) => s.subscriptions);
  const currency = useStore((s) => s.settings.currency);
  const monthlyHistory = useStore((s) => s.monthlyHistory);
  const categories = useCategories();
  const resolveCat = useCategoryResolver();

  const totals = useMemo(() => computeTotals(subs), [subs]);
  const byCat = useMemo(() => spendingByCategory(subs), [subs]);

  const slices: DonutSlice[] = useMemo(
    () =>
      categories
        .map((c) => ({
          label: c.name,
          color: c.color,
          value: byCat[c.id] ?? 0,
        }))
        .filter((d) => d.value > 0),
    [byCat, categories],
  );

  // Real 12-month trend from persisted history.
  const monthlyBars: BarDatum[] = useMemo(
    () => buildMonthlyBars(monthlyHistory, totals.monthly, 12),
    [monthlyHistory, totals.monthly],
  );

  // True if we have at least one past month recorded (not just the current one).
  const hasHistory = useMemo(() => {
    const currentKey = format(new Date(), 'yyyy-MM');
    return Object.keys(monthlyHistory).some((k) => k !== currentKey);
  }, [monthlyHistory]);

  const topExpensive = useMemo(
    () =>
      [...subs]
        .map((s) => ({ sub: s, yearly: toYearly(s.price, s.cycle) }))
        .sort((a, b) => b.yearly - a.yearly)
        .slice(0, 3),
    [subs],
  );

  if (subs.length === 0) {
    return (
      <Screen>
        <Header />
        <EmptyState
          icon="stats-chart-outline"
          title="No data yet"
          subtitle="Add subscriptions to unlock insights and trends."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header />

      <Animated.View entering={FadeInDown.springify()}>
        <Card>
          <Text variant="caption" muted>
            YEARLY PROJECTION
          </Text>
          <Text variant="display" style={{ marginTop: 6 }}>
            {formatCompact(totals.yearly, currency)}
          </Text>
          <Text variant="bodySm" muted style={{ marginTop: 4 }}>
            Based on {totals.count} active subscription
            {totals.count !== 1 ? 's' : ''}
          </Text>
        </Card>
      </Animated.View>

      <SectionHeader title="Monthly trend" />
      <Card>
        {!hasHistory && (
          <Text variant="caption" muted style={{ marginBottom: spacing.md }}>
            History builds up over time. Past months will appear here
            automatically.
          </Text>
        )}
        <BarChart data={monthlyBars} height={150} />
      </Card>

      <SectionHeader title="By category" />
      <Card>
        <View style={styles.donutWrap}>
          <DonutChart
            data={slices}
            size={180}
            centerValue={formatCompact(totals.monthly, currency)}
            centerLabel="per month"
          />
        </View>
        <View style={{ marginTop: spacing.md }}>
          {slices.map((s) => {
            const pct = (s.value / Math.max(1, totals.monthly)) * 100;
            return (
              <View key={s.label} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <Text variant="body" style={{ flex: 1 }}>
                  {s.label}
                </Text>
                <Text variant="bodySm" muted style={{ marginRight: spacing.sm }}>
                  {pct.toFixed(0)}%
                </Text>
                <Text variant="body" weight="600">
                  {formatCurrency(s.value, currency)}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <SectionHeader title="Most expensive" />
      {topExpensive.map(({ sub, yearly }, i) => {
        const cat = resolveCat(sub.category);
        const accent = sub.color ?? cat.color;
        return (
          <Animated.View
            key={sub.id}
            entering={FadeInDown.delay(i * 80).springify()}
          >
            <Card style={{ marginBottom: spacing.sm }}>
              <View style={styles.expensiveRow}>
                <IconBadge
                  icon={(sub.icon as any) ?? cat.icon}
                  color={accent}
                  size={42}
                />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text variant="h3">{sub.name}</Text>
                  <Text variant="bodySm" muted>
                    {formatCurrency(toMonthly(sub.price, sub.cycle), currency)} / mo
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="h3">{formatCurrency(yearly, currency)}</Text>
                  <Text variant="caption" muted>
                    per year
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        );
      })}
    </Screen>
  );
}

const Header: React.FC = () => (
  <View style={styles.header}>
    <Text variant="caption" muted>
      INSIGHTS
    </Text>
    <Text variant="title">Statistics</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { marginTop: spacing.md, marginBottom: spacing.lg },
  donutWrap: { alignItems: 'center' },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  expensiveRow: { flexDirection: 'row', alignItems: 'center' },
});

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, LayoutChangeEvent } from 'react-native';
import {
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  addDays,
} from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { EmptyState } from '@/components/EmptyState';
import { useStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { groupByRenewalDay } from '@/utils/subscriptions';
import { formatCurrency } from '@/utils/format';
import { radius, spacing } from '@/constants/theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const theme = useTheme();
  const subs = useStore((s) => s.subscriptions);
  const currency = useStore((s) => s.settings.currency);

  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [gridWidth, setGridWidth] = useState(0);

  const grouped = useMemo(() => groupByRenewalDay(subs), [subs]);

  const maxDaily = useMemo(() => {
    let max = 0;
    Object.values(grouped).forEach((arr) => {
      const total = arr.reduce((sum, s) => sum + s.price, 0);
      if (total > max) max = total;
    });
    return max || 1;
  }, [grouped]);

  // Build the grid: always start on Sunday of the week containing the 1st.
  // Build the grid: always start on Sunday of the week containing the 1st.
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const selectedKey = format(selected, 'yyyy-MM-dd');
  const selectedSubs = grouped[selectedKey] ?? [];
  const selectedTotal = selectedSubs.reduce((sum, s) => sum + s.price, 0);

  // Exact pixel width per cell — avoids the floating-point % wrapping bug.
  const cellSize = gridWidth > 0 ? Math.floor(gridWidth / 7) : 0;

  const onGridLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - gridWidth) > 0.5) setGridWidth(w);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <Text variant="caption" muted>
            RENEWALS
          </Text>
          <Text variant="title">{format(cursor, 'MMMM yyyy')}</Text>
        </View>
        <View style={styles.navRow}>
          <Pressable
            onPress={() => setCursor((c) => addMonths(c, -1))}
            style={[styles.navBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Ionicons name="chevron-back" size={18} color={theme.text} />
          </Pressable>
          <View style={{ width: spacing.sm }} />
          <Pressable
            onPress={() => setCursor((c) => addMonths(c, 1))}
            style={[styles.navBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <Card>
        {/* Weekday header */}
        <View style={styles.weekRow} onLayout={onGridLayout}>
          {WEEKDAYS.map((d) => (
            <Text
              key={d}
              variant="caption"
              muted
              align="center"
              style={{ flex: 1 }}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* Day grid — rendered only after we know the width */}
        {cellSize > 0 && (
          <View style={styles.grid}>
            {days.map((day, i) => {
              const key = format(day, 'yyyy-MM-dd');
              const inMonth = isSameMonth(day, cursor);
              const isSel = isSameDay(day, selected);
              const dayItems = grouped[key];
              const dayTotal = dayItems?.reduce((s, x) => s + x.price, 0) ?? 0;
              const heat = dayTotal / maxDaily;

              return (
                <Pressable
                  key={i}
                  onPress={() => setSelected(day)}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize + 8,
                      backgroundColor: isSel
                        ? theme.accent
                        : dayTotal > 0
                        ? hexToRgba(theme.accent, 0.08 + heat * 0.25)
                        : 'transparent',
                      borderColor: isSel ? theme.accent : 'transparent',
                    },
                  ]}
                >
                  <Text
                    variant="bodySm"
                    weight="600"
                    align="center"
                    color={isSel ? '#0B0B10' : !inMonth ? theme.textDim : theme.text}
                  >
                    {format(day, 'd')}
                  </Text>
                  {dayItems ? (
                    <View
                      style={[
                        styles.dayDot,
                        { backgroundColor: isSel ? '#0B0B10' : theme.accent },
                      ]}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </Card>

      <View style={styles.selectedHeader}>
        <Text variant="h2">{format(selected, 'EEEE, MMM d')}</Text>
        {selectedTotal > 0 ? (
          <Text variant="bodySm" muted>
            {formatCurrency(selectedTotal, currency)} total
          </Text>
        ) : null}
      </View>

      {selectedSubs.length === 0 ? (
        <Animated.View entering={FadeIn}>
          <Card>
            <EmptyState
              icon="calendar-clear-outline"
              title="No renewals"
              subtitle="Nothing renews on this day."
            />
          </Card>
        </Animated.View>
      ) : (
        <ScrollView>
          {selectedSubs.map((sub, i) => (
            <SubscriptionCard key={sub.id} sub={sub} index={i} />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  navRow: { flexDirection: 'row' },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    marginVertical: 2,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});

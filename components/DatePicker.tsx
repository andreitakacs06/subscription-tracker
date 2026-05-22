import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import {
  addDays,
  addMonths,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  /** If true, dates before today cannot be selected. */
  minToday?: boolean;
}

export const DatePicker: React.FC<Props> = ({ value, onChange, minToday = true }) => {
  const theme = useTheme();
  const [cursor, setCursor] = useState<Date>(startOfMonth(value));
  const [gridWidth, setGridWidth] = useState(0);

  const today = useMemo(() => startOfDay(new Date()), []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const cellSize = gridWidth > 0 ? Math.floor(gridWidth / 7) : 0;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - gridWidth) > 0.5) setGridWidth(w);
  };

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {/* Month navigation */}
      <View style={styles.header}>
        <Pressable
          onPress={() => setCursor((c) => addMonths(c, -1))}
          style={[
            styles.navBtn,
            { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
          ]}
        >
          <Ionicons name="chevron-back" size={16} color={theme.text} />
        </Pressable>
        <Text variant="h3">{format(cursor, 'MMMM yyyy')}</Text>
        <Pressable
          onPress={() => setCursor((c) => addMonths(c, 1))}
          style={[
            styles.navBtn,
            { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
          ]}
        >
          <Ionicons name="chevron-forward" size={16} color={theme.text} />
        </Pressable>
      </View>

      {/* Weekday labels — also used to measure grid width */}
      <View style={styles.weekRow} onLayout={onLayout}>
        {WEEKDAYS.map((d) => (
          <Text
            key={d}
            variant="caption"
            muted
            align="center"
            style={{ flex: 1 }}
          >
            {d.slice(0, 1)}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      {cellSize > 0 && (
        <View style={styles.grid}>
          {days.map((day, i) => {
            const inMonth = isSameMonth(day, cursor);
            const selected = isSameDay(day, value);
            const isToday = isSameDay(day, today);
            const disabled = minToday && isBefore(day, today);

            return (
              <Pressable
                key={i}
                disabled={disabled}
                onPress={() => onChange(day)}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: selected ? theme.accent : 'transparent',
                    borderColor: isToday && !selected ? theme.accent : 'transparent',
                    opacity: disabled ? 0.3 : 1,
                  },
                ]}
              >
                <Text
                  variant="bodySm"
                  weight="600"
                  align="center"
                  color={
                    selected
                      ? '#0B0B10'
                      : !inMonth
                      ? theme.textDim
                      : theme.text
                  }
                >
                  {format(day, 'd')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginVertical: 2,
  },
});

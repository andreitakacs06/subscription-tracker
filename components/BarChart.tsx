import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

export interface BarDatum {
  label: string;
  value: number;
}

interface Props {
  data: BarDatum[];
  height?: number;
}

/**
 * Lightweight vertical bar chart built with react-native-svg.
 *
 * The chart fills the width of its parent container and divides that space
 * evenly between the data points, so it never overflows the surrounding
 * card no matter how many bars are rendered.
 */
export const BarChart: React.FC<Props> = ({ data, height = 160 }) => {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = data.length > 0 ? width / data.length : 0;
  const barWidth = Math.max(2, Math.min(slot * 0.62, 22));

  const onLayout = (e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout.width;
    if (Math.abs(next - width) > 0.5) setWidth(next);
  };

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.accent2} stopOpacity={1} />
              <Stop offset="1" stopColor={theme.accent} stopOpacity={0.85} />
            </LinearGradient>
          </Defs>
          {data.map((d, i) => {
            const h = (d.value / max) * (height - 12);
            const x = i * slot + (slot - barWidth) / 2;
            const y = height - h;
            return (
              <Rect
                key={d.label + i}
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={Math.min(8, barWidth / 2)}
                fill="url(#barGrad)"
              />
            );
          })}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}

      <Animated.View
        entering={FadeInUp.delay(80).springify()}
        style={[styles.labels, { width }]}
      >
        {data.map((d, i) => (
          <View
            key={d.label + i}
            style={{ width: slot, alignItems: 'center' }}
          >
            <Text variant="caption" muted>
              {d.label}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  // unused but reserved if you want to wrap chart in a card later
  card: { borderRadius: radius.lg },
});

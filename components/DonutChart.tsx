import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/theme';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: DonutSlice[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

/**
 * SVG donut chart with rounded slice ends.
 * Slices are drawn as stroked circles using strokeDasharray to define their length.
 */
export const DonutChart: React.FC<Props> = ({
  data,
  size = 180,
  centerLabel,
  centerValue,
}) => {
  const theme = useTheme();
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let offset = 0;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {/* Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.surfaceAlt}
            strokeWidth={stroke}
            fill="none"
          />
          {data.map((slice, i) => {
            const fraction = slice.value / total;
            const length = fraction * circumference;
            const dashArray = `${length} ${circumference - length}`;
            const dashOffset = -offset;
            offset += length;
            return (
              <Circle
                key={slice.label + i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={slice.color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            );
          })}
        </G>
      </Svg>

      <View style={styles.center} pointerEvents="none">
        {centerValue ? <Text variant="title">{centerValue}</Text> : null}
        {centerLabel ? (
          <Text variant="caption" muted style={{ marginTop: 2 }}>
            {centerLabel.toUpperCase()}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
});

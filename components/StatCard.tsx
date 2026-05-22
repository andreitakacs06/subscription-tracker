import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { radius, shadow, spacing } from '@/constants/theme';

interface Props {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Optional gradient pair for emphasized cards. */
  gradient?: [string, string];
  delay?: number;
}

/**
 * Compact KPI card used on the dashboard. Animates in on mount.
 */
export const StatCard: React.FC<Props> = ({
  label,
  value,
  icon,
  gradient,
  delay = 0,
}) => {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(14)}
      style={[
        styles.wrap,
        gradient ? shadow.glow(gradient[0]) : shadow.card,
        {
          backgroundColor: gradient ? 'transparent' : theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      {gradient ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
        />
      ) : null}

      <View style={styles.row}>
        <Text
          variant="caption"
          color={gradient ? 'rgba(255,255,255,0.85)' : theme.textMuted}
        >
          {label.toUpperCase()}
        </Text>
        {icon ? (
          <Ionicons
            name={icon}
            size={16}
            color={gradient ? 'rgba(255,255,255,0.85)' : theme.textMuted}
          />
        ) : null}
      </View>

      <Text
        variant="title"
        color={gradient ? '#fff' : theme.text}
        style={{ marginTop: spacing.sm }}
      >
        {value}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: 'hidden',
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

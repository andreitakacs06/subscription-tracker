import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/** Friendly empty state with a soft icon halo. */
export const EmptyState: React.FC<Props> = ({
  icon = 'sparkles-outline',
  title,
  subtitle,
  action,
}) => {
  const theme = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrap}>
      <View
        style={[
          styles.halo,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Ionicons name={icon} size={42} color={theme.accent} />
      </View>
      <Text variant="h2" align="center" style={{ marginTop: spacing.lg }}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="body" muted align="center" style={{ marginTop: spacing.sm }}>
          {subtitle}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: spacing.lg }}>{action}</View> : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  halo: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

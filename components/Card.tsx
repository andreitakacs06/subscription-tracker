import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius, shadow, spacing } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  /** Optional accent color for a subtle glow effect. */
  glow?: string;
}

/** Soft surface used everywhere to keep visual rhythm consistent. */
export const Card: React.FC<Props> = ({ children, style, padded = true, glow }) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          padding: padded ? spacing.lg : 0,
        },
        glow ? shadow.glow(glow) : shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});

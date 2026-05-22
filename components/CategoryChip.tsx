import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

interface Props {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  color?: string;
  onPress?: () => void;
}

/** Pill-shaped filter chip used in the subscriptions list and forms. */
export const CategoryChip: React.FC<Props> = ({
  label,
  icon,
  active,
  color,
  onPress,
}) => {
  const theme = useTheme();
  const accent = color ?? theme.accent;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? accent : theme.surface,
          borderColor: active ? accent : theme.border,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? '#fff' : theme.textMuted}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text
        variant="bodySm"
        weight="600"
        color={active ? '#fff' : theme.text}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
});

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<Props> = ({ title, actionLabel, onAction }) => {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="h2">{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text variant="bodySm" color={theme.accent}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});

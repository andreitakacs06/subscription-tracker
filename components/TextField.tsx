import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

interface Props extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

export const TextField: React.FC<Props> = ({ label, icon, error, style, ...rest }) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text variant="caption" muted style={{ marginBottom: 6, marginLeft: 4 }}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <View
        style={[
          styles.row,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : focused ? theme.accent : theme.border,
          },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={theme.textMuted}
            style={{ marginRight: spacing.sm }}
          />
        ) : null}
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={theme.textDim}
          style={[styles.input, { color: theme.text }, style]}
        />
      </View>
      {error ? (
        <Text variant="caption" color={theme.danger} style={{ marginTop: 4, marginLeft: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
});

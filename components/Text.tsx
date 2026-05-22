import React from 'react';
import { Text as RNText, TextProps, StyleSheet, TextStyle } from 'react-native';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Variant = keyof typeof typography;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  muted?: boolean;
  dim?: boolean;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
}

export const Text: React.FC<Props> = ({
  variant = 'body',
  color,
  muted,
  dim,
  weight,
  align,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const resolved =
    color ?? (dim ? theme.textDim : muted ? theme.textMuted : theme.text);

  return (
    <RNText
      {...rest}
      style={[
        typography[variant],
        { color: resolved, textAlign: align },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    >
      {children}
    </RNText>
  );
};

export const textStyles = StyleSheet.create({});

import React from 'react';
import { Pressable, StyleSheet, ViewStyle, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

/**
 * Pressable button with three variants. The primary variant uses a soft
 * gradient and triggers a light haptic for a more "premium" feel.
 */
export const Button: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
  fullWidth = true,
}) => {
  const theme = useTheme();

  const handlePress = () => {
    if (disabled) return;
    Haptics.selectionAsync().catch(() => {});
    onPress();
  };

  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    opacity: disabled ? 0.5 : 1,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  };

  const content = (
    <>
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={variant === 'primary' ? '#fff' : theme.text}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text variant="h3" color={variant === 'primary' ? '#fff' : theme.text}>
        {label}
      </Text>
    </>
  );

  if (variant === 'primary') {
    return (
      <Pressable onPress={handlePress} disabled={disabled} style={[baseStyle, style]}>
        <LinearGradient
          colors={[theme.accent, theme.accent2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.row}>{content}</View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        baseStyle,
        variant === 'secondary'
          ? { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }
          : null,
        style,
      ]}
    >
      <View style={styles.row}>{content}</View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});

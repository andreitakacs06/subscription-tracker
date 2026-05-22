import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius } from '@/constants/theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
}

/**
 * Rounded square icon badge tinted with the given accent color.
 * Used for subscription cards and category chips.
 */
export const IconBadge: React.FC<Props> = ({ icon, color, size = 44 }) => {
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          backgroundColor: hexToRgba(color, 0.18),
          borderColor: hexToRgba(color, 0.35),
        },
      ]}
    >
      <Ionicons name={icon} size={size * 0.5} color={color} />
    </View>
  );
};

function hexToRgba(hex: string, alpha: number): string {
  if (!hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

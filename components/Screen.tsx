import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

/**
 * Layout wrapper that handles safe areas, background color, and consistent padding.
 * Pass `scroll` for scrollable screens; otherwise content is fixed.
 */
export const Screen: React.FC<Props> = ({
  children,
  scroll = false,
  padded = true,
  style,
  contentStyle,
}) => {
  const theme = useTheme();
  const paddingStyle = padded ? { paddingHorizontal: spacing.lg } : undefined;

  return (
    <SafeAreaView
      edges={['top']}
      style={[{ flex: 1, backgroundColor: theme.background }, style]}
    >
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            paddingStyle,
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, paddingStyle, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
});

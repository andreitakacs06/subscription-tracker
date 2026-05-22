import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/hooks/useStore';
import { useCategoryResolver } from '@/hooks/useCategories';
import {
  computeTotals,
  getUpcoming,
} from '@/utils/subscriptions';
import { formatCompact, formatCurrency } from '@/utils/format';
import { radius, spacing, shadow } from '@/constants/theme';

/**
 * 4×3 dashboard widget — a self-contained tile that mirrors what an
 * iOS / Android home-screen widget would show.
 *
 * Shows:
 *   • Monthly total (large)
 *   • Yearly total + active count
 *   • Next 2 upcoming renewals
 *
 * Tapping the tile takes you straight to the subscriptions list.
 * The visual style mimics a home-screen widget so users instantly understand
 * the metaphor when we ship native widgets in a future build.
 */
export const DashboardWidget: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const subs = useStore((s) => s.subscriptions);
  const currency = useStore((s) => s.settings.currency);
  const resolveCat = useCategoryResolver();

  const totals = React.useMemo(() => computeTotals(subs), [subs]);
  const upcoming = React.useMemo(() => getUpcoming(subs, 2), [subs]);

  return (
    <Animated.View entering={FadeInDown.springify().damping(16)}>
      <Pressable onPress={() => router.push('/(tabs)/subscriptions')}>
        <View style={[styles.tile, shadow.glow(theme.accent)]}>
          <LinearGradient
            colors={[theme.accent, theme.accent2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Subtle dot pattern, decorative only. */}
          <View pointerEvents="none" style={styles.patternWrap}>
            {Array.from({ length: 32 }).map((_, i) => (
              <View key={i} style={styles.patternDot} />
            ))}
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <Ionicons name="sparkles" size={14} color="#0B0B10" />
              <Text
                variant="caption"
                weight="700"
                color="#0B0B10"
                style={{ marginLeft: 6, letterSpacing: 1 }}
              >
                SUBTRACK
              </Text>
            </View>
            <View style={styles.badge}>
              <Text variant="caption" weight="700" color="#0B0B10">
                {totals.count} active
              </Text>
            </View>
          </View>

          {/* Big monthly number */}
          <Text variant="caption" color="#0B0B10" style={{ opacity: 0.8 }}>
            THIS MONTH
          </Text>
          <Text
            variant="display"
            color="#0B0B10"
            style={{ marginTop: 2, fontSize: 36, lineHeight: 40 }}
          >
            {formatCompact(totals.monthly, currency)}
          </Text>
          <Text variant="bodySm" color="#0B0B10" style={{ opacity: 0.7 }}>
            {formatCompact(totals.yearly, currency)} per year
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Upcoming list */}
          {upcoming.length === 0 ? (
            <Text variant="bodySm" color="#0B0B10" style={{ opacity: 0.7 }}>
              No upcoming renewals.
            </Text>
          ) : (
            upcoming.map((u) => {
              const cat = resolveCat(u.sub.category);
              return (
                <View key={u.sub.id} style={styles.upRow}>
                  <View
                    style={[
                      styles.upIcon,
                      { backgroundColor: 'rgba(11,11,16,0.12)' },
                    ]}
                  >
                    <Ionicons
                      name={(u.sub.icon as any) ?? cat.icon}
                      size={14}
                      color="#0B0B10"
                    />
                  </View>
                  <Text
                    variant="bodySm"
                    weight="600"
                    color="#0B0B10"
                    style={{ flex: 1 }}
                    numberOfLines={1}
                  >
                    {u.sub.name}
                  </Text>
                  <Text variant="caption" color="#0B0B10" style={{ opacity: 0.7, marginRight: spacing.sm }}>
                    {u.label}
                  </Text>
                  <Text variant="bodySm" weight="700" color="#0B0B10">
                    {formatCurrency(u.sub.price, u.sub.currency)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    minHeight: 220,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,11,16,0.15)',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(11,11,16,0.25)',
    marginVertical: spacing.md,
  },
  upRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  upIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  patternWrap: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 200,
    height: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.18,
    transform: [{ rotate: '12deg' }],
  },
  patternDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0B0B10',
    margin: 8,
  },
});

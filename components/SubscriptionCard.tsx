import React, { useRef } from 'react';
import { Pressable, StyleSheet, View, Alert } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { IconBadge } from '@/components/IconBadge';
import { Subscription } from '@/types';
import { formatCurrency } from '@/utils/format';
import { formatRenewalShort } from '@/utils/subscriptions';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/hooks/useStore';
import { useCategoryResolver } from '@/hooks/useCategories';
import { spacing, radius } from '@/constants/theme';

interface Props {
  sub: Subscription;
  onPress?: (sub: Subscription) => void;
  index?: number;
  /** When false, hides the swipe-to-delete affordance (e.g. inside a modal). */
  swipeable?: boolean;
}

const CYCLE_LABEL: Record<Subscription['cycle'], string> = {
  weekly: '/wk',
  monthly: '/mo',
  yearly: '/yr',
};

/**
 * Row card representing a single subscription.
 *
 * Quick actions:
 * - Tap → open detail screen
 * - Swipe left → reveals Edit and Delete buttons
 * - Long press → quick action sheet (edit / delete)
 */
export const SubscriptionCard: React.FC<Props> = ({
  sub,
  onPress,
  index = 0,
  swipeable = true,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const remove = useStore((s) => s.removeSubscription);
  const resolveCat = useCategoryResolver();
  const swipeRef = useRef<Swipeable>(null);

  const cat = resolveCat(sub.category);
  const accent = sub.color ?? cat.color;
  const icon = (sub.icon as any) ?? cat.icon;

  const confirmDelete = () => {
    Alert.alert(
      'Delete subscription?',
      `${sub.name} will be removed.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => swipeRef.current?.close() },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            await remove(sub.id);
          },
        },
      ],
    );
  };

  const goEdit = () => {
    swipeRef.current?.close();
    router.push({ pathname: '/subscription/[id]/edit', params: { id: sub.id } });
  };

  const showQuickActions = () => {
    Haptics.selectionAsync().catch(() => {});
    Alert.alert(sub.name, 'Choose an action', [
      { text: 'Edit', onPress: goEdit },
      { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderRightActions = () => (
    <View style={styles.actions}>
      <RectButton
        onPress={goEdit}
        style={[styles.action, { backgroundColor: theme.accent }]}
      >
        <Ionicons name="create-outline" size={20} color="#0B0B10" />
        <Text variant="caption" weight="700" color="#0B0B10" style={{ marginTop: 2 }}>
          Edit
        </Text>
      </RectButton>
      <RectButton
        onPress={confirmDelete}
        style={[styles.action, { backgroundColor: theme.danger }]}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text variant="caption" weight="700" color="#fff" style={{ marginTop: 2 }}>
          Delete
        </Text>
      </RectButton>
    </View>
  );

  const inner = (
    <Pressable
      onPress={() => onPress?.(sub)}
      onLongPress={showQuickActions}
      delayLongPress={300}
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <IconBadge icon={icon} color={accent} />
          <View style={styles.middle}>
            <Text variant="h3" numberOfLines={1}>
              {sub.name}
            </Text>
            <View style={styles.subRow}>
              <Text variant="bodySm" muted>
                {cat.name}
              </Text>
              <View style={[styles.dot, { backgroundColor: theme.textDim }]} />
              <Text variant="bodySm" muted>
                Renews {formatRenewalShort(sub.renewalDate)}
              </Text>
            </View>
          </View>
          <View style={styles.right}>
            <Text variant="h3">
              {formatCurrency(sub.price, sub.currency)}
            </Text>
            <Text variant="caption" muted>
              {CYCLE_LABEL[sub.cycle]}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.textDim}
            style={{ marginLeft: spacing.sm }}
          />
        </View>
      </Card>
    </Pressable>
  );

  return (
    <Animated.View entering={FadeInUp.delay(index * 40).springify().damping(16)}>
      {swipeable ? (
        <Swipeable
          ref={swipeRef}
          renderRightActions={renderRightActions}
          overshootRight={false}
          friction={2}
          rightThreshold={40}
          onSwipeableWillOpen={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
          }
        >
          {inner}
        </Swipeable>
      ) : (
        inner
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  middle: { flex: 1, marginLeft: spacing.md },
  subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: { width: 3, height: 3, borderRadius: 2, marginHorizontal: 6 },
  right: { alignItems: 'flex-end' },
  actions: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  action: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    borderRadius: radius.lg,
  },
});

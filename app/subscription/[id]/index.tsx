import React from 'react';
import { View, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { Button } from '@/components/Button';
import { useStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { useCategoryResolver } from '@/hooks/useCategories';
import { formatCurrency } from '@/utils/format';
import { formatRenewalShort, toMonthly, toYearly } from '@/utils/subscriptions';
import { spacing, radius } from '@/constants/theme';

const CYCLE_LABEL: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

/** Detail view for a single subscription with edit and delete actions. */
export default function SubscriptionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const sub = useStore((s) => s.subscriptions.find((x) => x.id === id));
  const remove = useStore((s) => s.removeSubscription);
  const resolveCat = useCategoryResolver();

  if (!sub) {
    return (
      <Screen>
        <Text variant="h2">Not found</Text>
      </Screen>
    );
  }

  const cat = resolveCat(sub.category);
  const accent = sub.color ?? cat.color;

  const handleDelete = () => {
    Alert.alert(
      'Delete subscription?',
      `${sub.name} will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await remove(sub.id);
            router.back();
          },
        },
      ],
    );
  };

  const goEdit = () =>
    router.push({ pathname: '/subscription/[id]/edit', params: { id: sub.id } });

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.iconBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text variant="h2">Details</Text>
        <View style={{ flexDirection: 'row' }}>
          <Pressable
            onPress={goEdit}
            style={[
              styles.iconBtn,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                marginRight: spacing.sm,
              },
            ]}
          >
            <Ionicons name="create-outline" size={18} color={theme.accent} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={[
              styles.iconBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
      >
        <Animated.View entering={FadeInDown.springify()}>
          <Card glow={accent}>
            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <IconBadge
                icon={(sub.icon as any) ?? cat.icon}
                color={accent}
                size={72}
              />
              <Text variant="title" style={{ marginTop: spacing.md }}>
                {sub.name}
              </Text>
              <Text variant="bodySm" muted style={{ marginTop: 4 }}>
                {cat.name}
              </Text>

              <Text variant="display" style={{ marginTop: spacing.md }}>
                {formatCurrency(sub.price, sub.currency)}
              </Text>
              <Text variant="bodySm" muted>
                {CYCLE_LABEL[sub.cycle]}
              </Text>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.statRow}>
          <MiniStat
            label="Per month"
            value={formatCurrency(toMonthly(sub.price, sub.cycle), sub.currency)}
          />
          <View style={{ width: spacing.md }} />
          <MiniStat
            label="Per year"
            value={formatCurrency(toYearly(sub.price, sub.cycle), sub.currency)}
          />
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <Row label="Next renewal" value={formatRenewalShort(sub.renewalDate)} />
          <Row label="Category" value={cat.name} />
          <Row label="Cycle" value={CYCLE_LABEL[sub.cycle]} />
          {sub.note ? <Row label="Note" value={sub.note} /> : null}
        </Card>

        <Button
          label="Edit subscription"
          icon="create-outline"
          onPress={goEdit}
          style={{ marginTop: spacing.xl }}
        />
        <Button
          label="Delete subscription"
          icon="trash-outline"
          variant="secondary"
          onPress={handleDelete}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </Screen>
  );
}

const MiniStat: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.mini,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Text variant="caption" muted>
        {label.toUpperCase()}
      </Text>
      <Text variant="h2" style={{ marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <Text variant="bodySm" muted>
        {label}
      </Text>
      <Text variant="body" weight="600">
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  mini: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});

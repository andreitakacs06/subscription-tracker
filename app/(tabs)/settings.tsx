import React, { useState } from 'react';
import { View, StyleSheet, Switch, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { useStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { CURRENCIES } from '@/constants/currencies';
import { radius, spacing } from '@/constants/theme';

const LEAD_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Same day' },
  { value: 1, label: '1 day before' },
  { value: 2, label: '2 days before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '1 week before' },
];

/**
 * Settings screen.
 * - Dark mode toggle
 * - Currency picker
 * - Notifications toggle + lead-time picker
 * - Manage custom categories
 * - Reset all data
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const resetAll = useStore((s) => s.resetAll);
  const customCount = useStore(
    (s) => s.categories.filter((c) => !c.builtin).length,
  );

  const [showCurrencies, setShowCurrencies] = useState(false);
  const [showLeadTimes, setShowLeadTimes] = useState(false);

  const leadLabel =
    LEAD_OPTIONS.find((o) => o.value === settings.notificationLeadDays)?.label ??
    `${settings.notificationLeadDays} days before`;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="caption" muted>
          PREFERENCES
        </Text>
        <Text variant="title">Settings</Text>
      </View>

      <Card padded={false}>
        <Row
          icon="moon"
          label="Dark mode"
          right={
            <Switch
              value={settings.darkMode}
              onValueChange={(v) => setSettings({ darkMode: v })}
              trackColor={{ false: theme.surfaceAlt, true: theme.accent }}
              thumbColor="#fff"
            />
          }
        />
        <Divider />
        <Row
          icon="cash-outline"
          label="Currency"
          value={settings.currency}
          onPress={() => setShowCurrencies((v) => !v)}
        />
        {showCurrencies ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.currencyRow}
          >
            {CURRENCIES.map((c) => {
              const active = settings.currency === c.code;
              return (
                <Pressable
                  key={c.code}
                  onPress={() => {
                    setSettings({ currency: c.code });
                    setShowCurrencies(false);
                  }}
                  style={[
                    styles.currencyChip,
                    {
                      backgroundColor: active ? theme.accent : theme.surface,
                      borderColor: active ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Text
                    variant="bodySm"
                    weight="700"
                    color={active ? '#0B0B10' : theme.text}
                  >
                    {c.symbol} {c.code}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
        <Divider />
        <Row
          icon="notifications-outline"
          label="Renewal reminders"
          right={
            <Switch
              value={settings.notifications}
              onValueChange={(v) => setSettings({ notifications: v })}
              trackColor={{ false: theme.surfaceAlt, true: theme.accent }}
              thumbColor="#fff"
            />
          }
        />
        {settings.notifications ? (
          <>
            <Divider />
            <Row
              icon="time-outline"
              label="Reminder timing"
              value={leadLabel}
              onPress={() => setShowLeadTimes((v) => !v)}
            />
            {showLeadTimes ? (
              <View style={styles.leadList}>
                {LEAD_OPTIONS.map((opt) => {
                  const active = settings.notificationLeadDays === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        setSettings({ notificationLeadDays: opt.value });
                        setShowLeadTimes(false);
                      }}
                      style={[
                        styles.leadChip,
                        {
                          backgroundColor: active ? theme.accent : theme.surface,
                          borderColor: active ? theme.accent : theme.border,
                        },
                      ]}
                    >
                      <Text
                        variant="bodySm"
                        weight="600"
                        color={active ? '#0B0B10' : theme.text}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </>
        ) : null}
      </Card>

      <SectionHeader title="Customize" />
      <Card padded={false}>
        <Row
          icon="grid-outline"
          label="Categories"
          value={customCount > 0 ? `${customCount} custom` : 'Add your own'}
          onPress={() => router.push('/categories')}
        />
      </Card>

      <SectionHeader title="Data" />
      <Card padded={false}>
        <Row
          icon="cloud-upload-outline"
          label="Export data"
          value="Coming soon"
          onPress={() =>
            Alert.alert(
              'Export',
              'CSV/JSON export will be available in a future update.',
            )
          }
        />
        <Divider />
        <Row
          icon="trash-outline"
          label="Reset all data"
          danger
          onPress={() =>
            Alert.alert(
              'Reset everything?',
              'This clears all subscriptions and settings on this device.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => resetAll(),
                },
              ],
            )
          }
        />
      </Card>

      <SectionHeader title="About" />
      <Card>
        <Text variant="h3">Subtrack</Text>
        <Text variant="bodySm" muted style={{ marginTop: 4 }}>
          Check your daily / weekly / monthly subscriptions in a single app.
        </Text>
        <Text variant="caption" muted style={{ marginTop: spacing.md }}>
          Version 1.0.15
        </Text>
      </Card>
    </Screen>
  );
}

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}

const Row: React.FC<RowProps> = ({ icon, label, value, onPress, right, danger }) => {
  const theme = useTheme();
  const color = danger ? theme.danger : theme.text;
  const Wrapper: any = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={styles.row}>
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text variant="body" color={color} style={{ flex: 1 }}>
        {label}
      </Text>
      {value ? (
        <Text variant="bodySm" muted style={{ marginRight: 8 }}>
          {value}
        </Text>
      ) : null}
      {right ?? (onPress ? (
        <Ionicons name="chevron-forward" size={18} color={theme.textDim} />
      ) : null)}
    </Wrapper>
  );
};

const Divider: React.FC = () => {
  const theme = useTheme();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.border,
        marginLeft: 60,
      }}
    />
  );
};

const styles = StyleSheet.create({
  header: { marginTop: spacing.md, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: spacing.md,
  },
  currencyRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  currencyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  leadList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  leadChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
});

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, formatISO, parseISO } from 'date-fns';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { CategoryChip } from '@/components/CategoryChip';
import { SectionHeader } from '@/components/SectionHeader';
import { DatePicker } from '@/components/DatePicker';
import { useTheme } from '@/hooks/useTheme';
import { useCategories } from '@/hooks/useCategories';
import { BillingCycle, CategoryId, Subscription } from '@/types';
import { radius, spacing } from '@/constants/theme';

const CYCLES: { id: BillingCycle; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

const ACCENTS = [
  '#7DD3FC',
  '#38BDF8',
  '#34D399',
  '#F59E0B',
  '#F43F5E',
  '#A78BFA',
  '#EC4899',
  '#10B981',
];

const ICONS: string[] = [
  'film',
  'musical-notes',
  'briefcase',
  'cloud',
  'barbell',
  'newspaper',
  'game-controller',
  'school',
  'cart',
  'sparkles',
];

export interface SubscriptionFormValue {
  name: string;
  price: number;
  cycle: BillingCycle;
  category: CategoryId;
  renewalDate: string;
  color: string;
  icon: string;
  note?: string;
}

interface Props {
  /** Title shown above the form. */
  title: string;
  /** Existing subscription when editing; absent when creating. */
  initial?: Subscription;
  /** Currency to use for newly entered prices. */
  currency: string;
  /** Submit label, e.g. "Save" or "Save changes". */
  submitLabel: string;
  onSubmit: (value: SubscriptionFormValue) => Promise<void> | void;
  /** Optional secondary button (e.g. "Manage categories"). */
  onManageCategories?: () => void;
}

/**
 * Shared form used by both the Add and Edit subscription screens.
 * Encapsulates field state, validation, and the date picker so the
 * surrounding screens stay thin.
 */
export const SubscriptionForm: React.FC<Props> = ({
  title,
  initial,
  currency,
  submitLabel,
  onSubmit,
  onManageCategories,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const categories = useCategories();

  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState(
    initial ? String(initial.price) : '',
  );
  const [cycle, setCycle] = useState<BillingCycle>(initial?.cycle ?? 'monthly');
  const [category, setCategory] = useState<CategoryId>(
    initial?.category ?? 'entertainment',
  );
  const [renewalDate, setRenewalDate] = useState<Date>(() => {
    if (initial) {
      try {
        return parseISO(initial.renewalDate);
      } catch {
        // fall through
      }
    }
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  });
  const [color, setColor] = useState<string>(initial?.color ?? ACCENTS[0]);
  const [icon, setIcon] = useState<string>(initial?.icon ?? 'sparkles');
  const [note, setNote] = useState(initial?.note ?? '');
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'Name is required';
    const priceNum = parseFloat(price.replace(',', '.'));
    if (!Number.isFinite(priceNum) || priceNum <= 0)
      nextErrors.price = 'Enter a valid price';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        price: priceNum,
        cycle,
        category,
        renewalDate: formatISO(renewalDate),
        color,
        icon,
        note: note.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="close" size={20} color={theme.text} />
        </Pressable>
        <Text variant="h2">{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            <TextField
              label="Name"
              icon="pricetag-outline"
              placeholder="Netflix"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />
            <TextField
              label={`Price (${currency})`}
              icon="cash-outline"
              placeholder="9.99"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
              error={errors.price}
            />

            <Text variant="caption" muted style={{ marginBottom: 6, marginLeft: 4 }}>
              BILLING CYCLE
            </Text>
            <View style={styles.row}>
              {CYCLES.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCycle(c.id)}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: cycle === c.id ? theme.accent : theme.surface,
                      borderColor: cycle === c.id ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Text
                    variant="bodySm"
                    weight="600"
                    color={cycle === c.id ? '#0B0B10' : theme.text}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text
              variant="caption"
              muted
              style={{ marginTop: spacing.md, marginBottom: spacing.sm, marginLeft: 4 }}
            >
              NEXT RENEWAL · {format(renewalDate, 'MMM d, yyyy').toUpperCase()}
            </Text>
            <DatePicker value={renewalDate} onChange={setRenewalDate} />
          </Card>

          <SectionHeader
            title="Category"
            actionLabel={onManageCategories ? 'Manage' : undefined}
            onAction={onManageCategories}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {categories.map((c) => (
              <CategoryChip
                key={c.id}
                label={c.name}
                icon={c.icon as any}
                color={c.color}
                active={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </ScrollView>

          <SectionHeader title="Accent" />
          <Card>
            <Text variant="caption" muted style={{ marginBottom: 6, marginLeft: 4 }}>
              COLOR
            </Text>
            <View style={[styles.row, { marginBottom: spacing.md }]}>
              {ACCENTS.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => setColor(a)}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: a,
                      borderColor: color === a ? '#fff' : 'transparent',
                    },
                  ]}
                />
              ))}
            </View>

            <Text variant="caption" muted style={{ marginBottom: 6, marginLeft: 4 }}>
              ICON
            </Text>
            <View style={[styles.row, { flexWrap: 'wrap' }]}>
              {ICONS.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setIcon(g)}
                  style={[
                    styles.iconChoice,
                    {
                      backgroundColor: icon === g ? theme.accent : theme.surface,
                      borderColor: icon === g ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={g as any}
                    size={18}
                    color={icon === g ? '#0B0B10' : theme.text}
                  />
                </Pressable>
              ))}
            </View>
          </Card>

          <SectionHeader title="Note" />
          <Card>
            <TextField
              icon="document-text-outline"
              placeholder="Optional note"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </Card>

          <Button
            label={submitLabel}
            icon="checkmark"
            onPress={submit}
            disabled={submitting}
            style={{ marginTop: spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  segment: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 2,
  },
  iconChoice: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
});

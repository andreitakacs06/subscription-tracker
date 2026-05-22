import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SubscriptionForm } from '@/components/SubscriptionForm';
import { Text } from '@/components/Text';
import { useStore } from '@/hooks/useStore';

/** Modal screen for editing an existing subscription. */
export default function EditSubscription() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sub = useStore((s) => s.subscriptions.find((x) => x.id === id));
  const updateSub = useStore((s) => s.updateSubscription);
  const currency = useStore((s) => s.settings.currency);

  if (!sub) {
    return (
      <Screen>
        <View style={{ padding: 24 }}>
          <Text variant="h2">Subscription not found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <SubscriptionForm
        title="Edit subscription"
        initial={sub}
        currency={sub.currency || currency}
        submitLabel="Save changes"
        onManageCategories={() => router.push('/categories')}
        onSubmit={async (value) => {
          await updateSub(sub.id, {
            name: value.name,
            price: value.price,
            cycle: value.cycle,
            renewalDate: value.renewalDate,
            category: value.category,
            color: value.color,
            icon: value.icon,
            note: value.note,
          });
          router.back();
        }}
      />
    </Screen>
  );
}

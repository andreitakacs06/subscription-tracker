import React from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SubscriptionForm } from '@/components/SubscriptionForm';
import { useStore } from '@/hooks/useStore';

/** Modal screen for creating a new subscription. */
export default function AddSubscription() {
  const router = useRouter();
  const addSub = useStore((s) => s.addSubscription);
  const currency = useStore((s) => s.settings.currency);

  return (
    <Screen padded={false}>
      <SubscriptionForm
        title="New subscription"
        currency={currency}
        submitLabel="Save subscription"
        onManageCategories={() => router.push('/categories')}
        onSubmit={async (value) => {
          await addSub({
            name: value.name,
            price: value.price,
            currency,
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

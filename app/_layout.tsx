import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Loading } from '@/components/Loading';

export default function RootLayout() {
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  const advanceStaleRenewals = useStore((s) => s.advanceStaleRenewals);
  const theme = useTheme();

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    hydrate();
  }, []);

  useEffect(() => {
    if (hydrated) {
      advanceStaleRenewals().catch((e) =>
        console.warn('[renewals] advance failed', e),
      );
    }
  }, [hydrated]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background).catch(() => {});
  }, [theme.background]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaProvider>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        {hydrated ? (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.background },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="add"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="subscription/[id]/index" />
            <Stack.Screen
              name="subscription/[id]/edit"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="categories"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack>
        ) : (
          <Loading label="Preparing your subscriptions…" />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/hooks/useStore';
import { Category } from '@/types';
import {
  CATEGORY_COLOR_CHOICES,
  CATEGORY_ICON_CHOICES,
} from '@/constants/categories';
import { radius, spacing } from '@/constants/theme';

/**
 * Manage Categories screen.
 * - Lists all categories (built-ins are read-only, custom can be deleted)
 * - Create new categories with a name, icon, and color
 */
export default function CategoriesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const categories = useStore((s) => s.categories);
  const subscriptions = useStore((s) => s.subscriptions);
  const addCategory = useStore((s) => s.addCategory);
  const removeCategory = useStore((s) => s.removeCategory);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(CATEGORY_ICON_CHOICES[0]);
  const [color, setColor] = useState<string>(CATEGORY_COLOR_CHOICES[0]);
  const [error, setError] = useState<string | undefined>();

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Pick a name for your category');
      return;
    }
    if (
      categories.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setError('A category with this name already exists');
      return;
    }
    setError(undefined);
    await addCategory({ name: trimmed, icon, color });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setName('');
    setIcon(CATEGORY_ICON_CHOICES[0]);
    setColor(CATEGORY_COLOR_CHOICES[0]);
  };

  const confirmRemove = (cat: Category) => {
    const usedBy = subscriptions.filter((s) => s.category === cat.id).length;
    const message =
      usedBy > 0
        ? `${usedBy} subscription${usedBy === 1 ? '' : 's'} will be moved to "Other".`
        : 'This category has no subscriptions assigned.';
    Alert.alert(`Delete "${cat.name}"?`, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeCategory(cat.id),
      },
    ]);
  };

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
          <Ionicons name="close" size={20} color={theme.text} />
        </Pressable>
        <Text variant="h2">Categories</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
          keyboardShouldPersistTaps="handled"
        >
          <SectionHeader title="New category" />
          <Card>
            <TextField
              label="Name"
              icon="pricetag-outline"
              placeholder="Streaming, Hobbies, Family…"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (error) setError(undefined);
              }}
              error={error}
            />

            <Text variant="caption" muted style={{ marginBottom: 6, marginLeft: 4 }}>
              ICON
            </Text>
            <View style={[styles.row, { flexWrap: 'wrap', marginBottom: spacing.md }]}>
              {CATEGORY_ICON_CHOICES.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setIcon(g)}
                  style={[
                    styles.iconChoice,
                    {
                      backgroundColor: icon === g ? color : theme.surface,
                      borderColor: icon === g ? color : theme.border,
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

            <Text variant="caption" muted style={{ marginBottom: 6, marginLeft: 4 }}>
              COLOR
            </Text>
            <View style={[styles.row, { flexWrap: 'wrap' }]}>
              {CATEGORY_COLOR_CHOICES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: c,
                      borderColor: color === c ? '#fff' : 'transparent',
                    },
                  ]}
                />
              ))}
            </View>

            <Button
              label="Add category"
              icon="add"
              onPress={create}
              style={{ marginTop: spacing.lg }}
            />
          </Card>

          <SectionHeader title="All categories" />
          {categories.map((cat, i) => (
            <Animated.View
              key={cat.id}
              entering={FadeInUp.delay(i * 30).springify().damping(16)}
            >
              <Card style={{ marginBottom: spacing.sm }}>
                <View style={styles.catRow}>
                  <View
                    style={[
                      styles.catIcon,
                      { backgroundColor: cat.color + '22', borderColor: cat.color },
                    ]}
                  >
                    <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text variant="h3">{cat.name}</Text>
                    <Text variant="caption" muted>
                      {cat.builtin ? 'Built-in' : 'Custom'}
                    </Text>
                  </View>
                  {!cat.builtin ? (
                    <Pressable
                      onPress={() => confirmRemove(cat)}
                      style={[
                        styles.deleteBtn,
                        { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                      ]}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.danger} />
                    </Pressable>
                  ) : (
                    <View
                      style={[
                        styles.lockBadge,
                        { backgroundColor: theme.surfaceAlt },
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={14}
                        color={theme.textMuted}
                      />
                    </View>
                  )}
                </View>
              </Card>
            </Animated.View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

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
  row: { flexDirection: 'row' },
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
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 8,
    borderWidth: 2,
  },
  catRow: { flexDirection: 'row', alignItems: 'center' },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

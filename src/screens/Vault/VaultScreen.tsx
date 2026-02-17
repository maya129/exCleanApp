import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useVaultStore } from '../../store/vaultStore';
import { logger } from '../../utils/logger';

const TAG = 'VaultScreen';

export function VaultScreen() {
  const { items, isUnlocked, unlock } = useVaultStore();

  useEffect(() => {
    logger.info(TAG, `Vault opened — unlocked: ${isUnlocked}, items: ${items.length}`);
  }, [isUnlocked]);

  if (!isUnlocked) {
    return (
      <SafeAreaView style={styles.lockedContainer}>
        <View style={styles.lockedContent}>
          <Text style={styles.lockIcon}>{'🔒'}</Text>
          <Text style={styles.lockedTitle}>Your Vault</Text>
          <Text style={styles.lockedSubtitle}>
            These memories are safe. Open when you're ready.
          </Text>
          {/* TODO: Phase 4 — Biometric authentication trigger */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Vault</Text>
        <Text style={styles.subtitle}>
          {items.length} {items.length === 1 ? 'memory' : 'memories'} safely
          stored
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nothing here yet. Your vault is ready when you are.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              {/* TODO: Phase 4 — Decrypted thumbnail */}
              <View style={styles.thumbnail} />
              <Text style={styles.itemType}>{item.type}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.vault.background,
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: colors.vault.background,
  },
  lockedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  lockedTitle: {
    ...typography.h1,
    color: colors.text.inverse,
    textAlign: 'center',
  },
  lockedSubtitle: {
    ...typography.body,
    color: colors.vault.accent,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  header: {
    padding: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.inverse,
  },
  subtitle: {
    ...typography.caption,
    color: colors.vault.accent,
    marginTop: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.vault.accent,
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: spacing.md,
  },
  gridItem: {
    flex: 1,
    margin: spacing.xs,
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.vault.surface,
    borderRadius: 8,
  },
  itemType: {
    ...typography.small,
    color: colors.vault.accent,
    marginTop: spacing.xs,
  },
});

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useScanStore } from '../../store/scanStore';
import { logger } from '../../utils/logger';
import { Button } from '../../components/ui/Button';

const TAG = 'ReviewGalleryScreen';

interface ReviewGalleryScreenProps {
  onComplete: () => void;
}

export function ReviewGalleryScreen({ onComplete }: ReviewGalleryScreenProps) {
  const scan = useScanStore((s) => s.scan);
  const setDecision = useScanStore((s) => s.setDecision);

  if (scan.status !== 'review') return null;

  const undecided = scan.results.filter((r) => !r.userDecision);
  const decided = scan.results.filter((r) => r.userDecision);

  const handleVault = (id: string) => {
    logger.info(TAG, `User chose vault for: ${id}`);
    setDecision(id, 'vault');
  };

  const handleDelete = (id: string) => {
    logger.info(TAG, `User chose delete for: ${id}`);
    setDecision(id, 'delete');
  };

  const handleKeep = (id: string) => {
    logger.info(TAG, `User chose keep for: ${id}`);
    setDecision(id, 'keep');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Matches</Text>
        <Text style={styles.subtitle}>
          You're in control. Nothing happens without your say.
        </Text>
        <Text style={styles.counter}>
          {decided.length} of {scan.results.length} reviewed
        </Text>
      </View>

      <FlatList
        data={scan.results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* TODO: Phase 3 — Thumbnail image */}
            <View style={styles.thumbnail} />
            <Text style={styles.matchType}>{item.matchType}</Text>
            <View style={styles.actions}>
              <Button
                title="Vault"
                onPress={() => handleVault(item.id)}
                variant={item.userDecision === 'vault' ? 'primary' : 'ghost'}
                size="small"
              />
              <Button
                title="Delete"
                onPress={() => handleDelete(item.id)}
                variant={item.userDecision === 'delete' ? 'danger' : 'ghost'}
                size="small"
              />
              <Button
                title="Keep"
                onPress={() => handleKeep(item.id)}
                variant={item.userDecision === 'keep' ? 'secondary' : 'ghost'}
                size="small"
              />
            </View>
          </View>
        )}
      />

      {undecided.length === 0 && (
        <View style={styles.footer}>
          <Button title="Apply decisions" onPress={onComplete} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  counter: {
    ...typography.bodyBold,
    color: colors.primary[500],
    marginTop: spacing.sm,
  },
  grid: {
    paddingHorizontal: spacing.md,
  },
  card: {
    flex: 1,
    margin: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.sm,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.neutral[200],
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  matchType: {
    ...typography.small,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  footer: {
    padding: spacing.xl,
  },
});

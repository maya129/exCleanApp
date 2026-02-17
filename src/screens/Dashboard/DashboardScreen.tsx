import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { useScanStore } from '../../store/scanStore';
import { useVaultStore } from '../../store/vaultStore';
import { logger } from '../../utils/logger';
import { Button } from '../../components/ui/Button';

const TAG = 'DashboardScreen';

interface DashboardScreenProps {
  onStartScan: () => void;
  onOpenVault: () => void;
}

export function DashboardScreen({ onStartScan, onOpenVault }: DashboardScreenProps) {
  const scan = useScanStore((s) => s.scan);
  const vaultItems = useVaultStore((s) => s.items);
  const coolingOffItems = useVaultStore((s) => s.coolingOffItems);

  const pendingDeletions = coolingOffItems.filter((c) => c.status === 'pending').length;

  logger.debug(TAG, 'Dashboard rendered', {
    scanStatus: scan.status,
    vaultCount: vaultItems.length,
    pendingDeletions,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Your space, your pace.</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          label="In Vault"
          value={vaultItems.length}
          color={colors.primary[500]}
        />
        <StatCard
          label="Pending Delete"
          value={pendingDeletions}
          color={colors.warning}
        />
      </View>

      {scan.status === 'complete' && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Last Cleanup</Text>
          <Text style={styles.summaryText}>
            {scan.summary.totalVaulted} vaulted, {scan.summary.totalDeleted}{' '}
            scheduled for deletion, {scan.summary.totalKept} kept
          </Text>
          <Text style={styles.encouragement}>You're doing great.</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button title="Start new scan" onPress={onStartScan} />
        <Button title="Open Vault" onPress={onOpenVault} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  greeting: {
    ...typography.h1,
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h1,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  summaryCard: {
    margin: spacing.xl,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  summaryTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  summaryText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  encouragement: {
    ...typography.bodyBold,
    color: colors.primary[500],
    marginTop: spacing.md,
  },
  actions: {
    padding: spacing.xl,
    gap: spacing.md,
    marginTop: 'auto',
  },
});

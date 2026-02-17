import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { useUserStore } from '../../store/userStore';
import { logger } from '../../utils/logger';

const TAG = 'SettingsScreen';

export function SettingsScreen() {
  const { user, subscriptionTier, logout } = useUserStore();

  const handleLogout = () => {
    logger.info(TAG, 'User initiated logout');
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingsRow label="Email" value={user?.email ?? 'Not signed in'} />
        <SettingsRow
          label="Plan"
          value={subscriptionTier === 'healing_pass' ? 'Healing Pass' : 'Free'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <SettingsRow label="Photo Library Access" value="Check" onPress={() => {
          // TODO: Phase 2 — open permission settings
          logger.info(TAG, 'Photo library access tapped');
        }} />
        <SettingsRow label="Calendar Access" value="Check" onPress={() => {
          logger.info(TAG, 'Calendar access tapped');
        }} />
      </View>

      {subscriptionTier === 'free' && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.upgradeCard} onPress={() => {
            // TODO: Phase 6 — RevenueCat paywall
            logger.info(TAG, 'Upgrade tapped');
          }}>
            <Text style={styles.upgradeTitle}>Upgrade to Healing Pass</Text>
            <Text style={styles.upgradeSubtitle}>
              AI-powered scans, Secure Vault backup, and more.
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SettingsRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </TouchableOpacity>
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
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  rowLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  rowValue: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  upgradeCard: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  upgradeTitle: {
    ...typography.bodyBold,
    color: colors.primary[700],
  },
  upgradeSubtitle: {
    ...typography.caption,
    color: colors.primary[600],
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: 'auto',
    padding: spacing.xl,
    alignItems: 'center',
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
  },
});

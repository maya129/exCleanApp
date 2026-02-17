import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useScanStore } from '../../store/scanStore';
import { logger } from '../../utils/logger';
import { ProgressBar } from '../../components/feedback/ProgressBar';

const TAG = 'ScanScreen';

const PHASE_LABELS: Record<string, string> = {
  faces: 'Scanning photos for faces...',
  dates: 'Checking date ranges...',
  calendar: 'Looking through calendar events...',
  messages: 'Reviewing messages...',
};

export function ScanScreen() {
  const scan = useScanStore((s) => s.scan);

  useEffect(() => {
    logger.info(TAG, `Scan state: ${scan.status}`);
  }, [scan.status]);

  if (scan.status === 'idle') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>No scan in progress.</Text>
      </SafeAreaView>
    );
  }

  if (scan.status === 'scanning') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Take your time.</Text>
          <Text style={styles.subtitle}>We'll handle the searching.</Text>
          <View style={styles.progressSection}>
            <ProgressBar progress={scan.progress} />
            <Text style={styles.phaseLabel}>
              {PHASE_LABELS[scan.phase] ?? 'Working...'}
            </Text>
            <Text style={styles.percentage}>
              {Math.round(scan.progress * 100)}%
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (scan.status === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{scan.message}</Text>
      </SafeAreaView>
    );
  }

  // 'review' and 'complete' states are handled by ReviewGalleryScreen / DashboardScreen
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  phaseLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  percentage: {
    ...typography.h3,
    color: colors.primary[500],
    marginTop: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  errorMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
});

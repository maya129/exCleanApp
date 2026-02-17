import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { useVaultStore, type VaultItem } from '../../store/vaultStore';
import { logger } from '../../utils/logger';
import { Button } from '../../components/ui/Button';

const TAG = 'VaultScreen';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GRID_GAP = spacing.xs;
const THUMBNAIL_SIZE = (SCREEN_WIDTH - spacing.md * 2 - GRID_GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

export function VaultScreen() {
  const { items, isUnlocked, unlock, lock } = useVaultStore();
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video' | 'calendar'>('all');
  const unlockAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    logger.info(TAG, 'VaultScreen mounted');
  }, []);

  useEffect(() => {
    logger.info(TAG, `Vault state changed — unlocked: ${isUnlocked}, items: ${items.length}`);
    if (isUnlocked) {
      Animated.spring(unlockAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      unlockAnim.setValue(0);
    }
  }, [isUnlocked]);

  const handleUnlock = () => {
    logger.info(TAG, 'User requesting vault unlock');
    // Phase 4: Replace with biometric authentication via react-native-biometrics
    // For now, unlock directly
    unlock();
  };

  const handleLock = () => {
    logger.info(TAG, 'User locking vault');
    lock();
  };

  const handleItemPress = (item: VaultItem) => {
    logger.info(TAG, `Item tapped: ${item.id} (${item.type})`);
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    logger.info(TAG, 'Item detail closed');
    setSelectedItem(null);
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    logger.info(TAG, `Filter changed: ${filter} → ${newFilter}`);
    setFilter(newFilter);
  };

  const filteredItems = filter === 'all'
    ? items
    : items.filter((item) => item.type === filter);

  // Locked state
  if (!isUnlocked) {
    return (
      <SafeAreaView style={styles.lockedContainer}>
        <View style={styles.lockedContent}>
          <Animated.View style={styles.lockIconWrapper}>
            <Text style={styles.lockIcon}>{"~"}</Text>
          </Animated.View>
          <Text style={styles.lockedTitle}>Your Vault</Text>
          <Text style={styles.lockedSubtitle}>
            These memories are safe and encrypted.{'\n'}Open when you're ready.
          </Text>
          <View style={styles.unlockButton}>
            <Button
              title="Unlock with Face ID"
              onPress={handleUnlock}
              variant="primary"
            />
          </View>
          <Text style={styles.lockedHint}>
            Only you can access this vault
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Unlocked state
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: unlockAnim,
            transform: [
              {
                translateY: unlockAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Your Vault</Text>
            <Text style={styles.subtitle}>
              {items.length} {items.length === 1 ? 'memory' : 'memories'} safely stored
            </Text>
          </View>
          <TouchableOpacity onPress={handleLock} style={styles.lockButton}>
            <Text style={styles.lockButtonText}>Lock</Text>
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        {items.length > 0 && (
          <View style={styles.filterRow}>
            {(['all', 'photo', 'video', 'calendar'] as const).map((f) => {
              const count = f === 'all'
                ? items.length
                : items.filter((i) => i.type === f).length;
              if (f !== 'all' && count === 0) return null;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterTab, filter === f && styles.filterTabActive]}
                  onPress={() => handleFilterChange(f)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === f && styles.filterTextActive,
                    ]}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    {' '}({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Animated.View>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{"~"}</Text>
          <Text style={styles.emptyTitle}>
            {items.length === 0 ? 'Nothing here yet' : 'No items match this filter'}
          </Text>
          <Text style={styles.emptyText}>
            {items.length === 0
              ? "Your vault is ready when you are. After scanning, items you choose to vault will appear here."
              : 'Try selecting a different filter.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.thumbnail}>
                <View style={styles.thumbnailPlaceholder}>
                  <Text style={styles.thumbnailIcon}>
                    {item.type === 'photo' ? 'IMG' : item.type === 'video' ? 'VID' : 'CAL'}
                  </Text>
                </View>
                {/* Type badge */}
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {item.type}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Item Detail Modal */}
      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedItem.type === 'calendar' ? 'Calendar Event' : selectedItem.type === 'video' ? 'Video' : 'Photo'}
                </Text>
                <View style={styles.modalPreview}>
                  <Text style={styles.modalPreviewText}>
                    {selectedItem.type === 'calendar' ? 'CAL' : selectedItem.type === 'video' ? 'VID' : 'IMG'}
                  </Text>
                </View>
                <View style={styles.modalMeta}>
                  <MetaRow label="Saved" value={new Date(selectedItem.createdAt).toLocaleDateString()} />
                  <MetaRow label="Match type" value={selectedItem.matchType.replace('_', ' ')} />
                  <MetaRow label="Source" value={selectedItem.source.replace('_', ' ')} />
                </View>
                <View style={styles.modalActions}>
                  <Button
                    title="Restore to library"
                    onPress={() => {
                      logger.info(TAG, `Restore requested: ${selectedItem.id}`);
                      handleCloseDetail();
                    }}
                    variant="secondary"
                    size="small"
                  />
                  <Button
                    title="Delete forever"
                    onPress={() => {
                      logger.info(TAG, `Permanent delete requested: ${selectedItem.id}`);
                      handleCloseDetail();
                    }}
                    variant="danger"
                    size="small"
                  />
                </View>
                <Button
                  title="Close"
                  onPress={handleCloseDetail}
                  variant="ghost"
                  size="small"
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
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
  lockIconWrapper: {
    marginBottom: spacing.lg,
  },
  lockIcon: {
    fontSize: 56,
    color: colors.vault.accent,
  },
  lockedTitle: {
    ...typography.h1,
    color: colors.text.inverse,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  lockedSubtitle: {
    ...typography.body,
    color: colors.vault.accent,
    textAlign: 'center',
    lineHeight: 26,
  },
  unlockButton: {
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 280,
  },
  lockedHint: {
    ...typography.small,
    color: colors.neutral[500],
    marginTop: spacing.md,
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  lockButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.vault.surface,
    borderRadius: borderRadius.sm,
  },
  lockButtonText: {
    ...typography.small,
    color: colors.vault.accent,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.vault.surface,
  },
  filterTabActive: {
    backgroundColor: colors.vault.accent,
  },
  filterText: {
    ...typography.small,
    color: colors.vault.accent,
  },
  filterTextActive: {
    color: colors.vault.background,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.vault.surface,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.inverse,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.vault.accent,
    textAlign: 'center',
    lineHeight: 24,
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  gridItem: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    margin: GRID_GAP / 2,
  },
  thumbnail: {
    flex: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: colors.vault.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    ...typography.caption,
    color: colors.vault.accent,
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: 4,
  },
  typeBadgeText: {
    ...typography.small,
    color: colors.text.inverse,
    fontSize: 10,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.vault.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.inverse,
    marginBottom: spacing.md,
  },
  modalPreview: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.vault.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalPreviewText: {
    ...typography.h2,
    color: colors.vault.accent,
  },
  modalMeta: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.vault.surface,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.vault.accent,
  },
  metaValue: {
    ...typography.caption,
    color: colors.text.inverse,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    width: '100%',
  },
});

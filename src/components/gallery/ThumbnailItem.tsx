import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export interface ThumbnailItemProps {
  id: string;
  uri: string | null;
  selected?: boolean;
  onPress?: () => void;
}

export function ThumbnailItem({ uri, selected = false, onPress }: ThumbnailItemProps) {
  const content = uri ? (
    <Image source={{ uri }} style={styles.image} />
  ) : (
    <View style={styles.placeholder} />
  );

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {content}
      {selected && <View style={styles.selectedOverlay} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral[200],
  },
  selected: {
    borderWidth: 3,
    borderColor: colors.primary[500],
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(61, 165, 195, 0.2)',
  },
});

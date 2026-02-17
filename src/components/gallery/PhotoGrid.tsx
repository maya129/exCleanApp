import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '../../theme/spacing';
import { ThumbnailItem, ThumbnailItemProps } from './ThumbnailItem';

interface PhotoGridProps {
  items: ThumbnailItemProps[];
  numColumns?: number;
  onItemPress?: (id: string) => void;
}

export function PhotoGrid({ items, numColumns = 3, onItemPress }: PhotoGridProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <ThumbnailItem
            {...item}
            onPress={onItemPress ? () => onItemPress(item.id) : undefined}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: spacing.xs,
  },
  cell: {
    flex: 1,
    margin: spacing.xs,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { logger } from '../../utils/logger';
import { Button } from '../../components/ui/Button';
import { MIN_REFERENCE_PHOTOS, MAX_REFERENCE_PHOTOS } from '../../utils/constants';

const TAG = 'TargetSelectionScreen';

interface TargetSelectionScreenProps {
  onComplete: (profile: {
    name: string;
    phoneNumber: string;
    referencePhotoUris: string[];
  }) => void;
  onBack?: () => void;
}

export function TargetSelectionScreen({
  onComplete,
  onBack,
}: TargetSelectionScreenProps) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'name' | 'phone' | 'photos'>('name');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    logger.info(TAG, 'TargetSelectionScreen mounted');
  }, []);

  const handleNameChange = (text: string) => {
    setName(text);
    logger.info(TAG, 'Name input changed');
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    logger.info(TAG, 'Phone input changed');
  };

  const handlePhotoSlotPress = (index: number) => {
    logger.info(TAG, `Photo slot ${index + 1} tapped — would open photo picker`);
    // In real implementation: launch photo picker via native bridge
    // For now, simulate adding a placeholder
    if (selectedPhotos.length <= index) {
      const newPhotos = [...selectedPhotos, `ph://placeholder_${index}`];
      setSelectedPhotos(newPhotos);
      logger.info(TAG, `Photo added — ${newPhotos.length}/${MAX_REFERENCE_PHOTOS} selected`);
    }
  };

  const handleRemovePhoto = (index: number) => {
    logger.info(TAG, `Removing photo at index ${index}`);
    const newPhotos = selectedPhotos.filter((_, i) => i !== index);
    setSelectedPhotos(newPhotos);
  };

  const handleContinue = () => {
    logger.info(TAG, 'User tapped Continue');

    if (!name.trim()) {
      logger.info(TAG, 'Validation failed: name is empty');
      triggerShake();
      setActiveSection('name');
      return;
    }

    if (selectedPhotos.length < MIN_REFERENCE_PHOTOS) {
      logger.info(TAG, `Validation failed: ${selectedPhotos.length}/${MIN_REFERENCE_PHOTOS} photos selected`);
      triggerShake();
      setActiveSection('photos');
      return;
    }

    logger.info(TAG, 'Validation passed — submitting profile');
    onComplete({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      referencePhotoUris: selectedPhotos,
    });
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const isValid = name.trim().length > 0 && selectedPhotos.length >= MIN_REFERENCE_PHOTOS;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Who are we looking for?</Text>
            <Text style={styles.subtitle}>
              This stays on your device. We never send personal data anywhere.
            </Text>
          </View>

          {/* Name Input */}
          <Animated.View
            style={[
              styles.inputSection,
              activeSection === 'name' && { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Text style={styles.label}>Their name</Text>
            <TextInput
              style={[styles.textInput, !name.trim() && activeSection === 'name' && styles.inputError]}
              placeholder="First name or nickname"
              placeholderTextColor={colors.neutral[400]}
              value={name}
              onChangeText={handleNameChange}
              onFocus={() => {
                setActiveSection('name');
                logger.info(TAG, 'Name input focused');
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <Text style={styles.hint}>
              We'll use this to search your calendar and contacts.
            </Text>
          </Animated.View>

          {/* Phone Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Their phone number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="(optional)"
              placeholderTextColor={colors.neutral[400]}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              onFocus={() => {
                setActiveSection('phone');
                logger.info(TAG, 'Phone input focused');
              }}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
            <Text style={styles.hint}>
              Helps find shared calendar events more accurately.
            </Text>
          </View>

          {/* Photo Selection */}
          <Animated.View
            style={[
              styles.inputSection,
              activeSection === 'photos' && { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Text style={styles.label}>
              Reference photos ({selectedPhotos.length}/{MIN_REFERENCE_PHOTOS}–{MAX_REFERENCE_PHOTOS})
            </Text>
            <Text style={styles.hint}>
              Pick {MIN_REFERENCE_PHOTOS}–{MAX_REFERENCE_PHOTOS} clear photos of their face. This helps our on-device
              AI recognize them across your library.
            </Text>

            <View style={styles.photoGrid}>
              {Array.from({ length: MAX_REFERENCE_PHOTOS }).map((_, i) => {
                const hasPhoto = i < selectedPhotos.length;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.photoSlot,
                      hasPhoto && styles.photoSlotFilled,
                      !hasPhoto && i === selectedPhotos.length && styles.photoSlotNext,
                    ]}
                    onPress={() => hasPhoto ? handleRemovePhoto(i) : handlePhotoSlotPress(i)}
                    activeOpacity={0.7}
                  >
                    {hasPhoto ? (
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoCheckmark}>{"~"}</Text>
                        <Text style={styles.photoRemoveHint}>tap to remove</Text>
                      </View>
                    ) : (
                      <View style={styles.photoEmpty}>
                        <Text style={styles.photoPlus}>+</Text>
                        {i === selectedPhotos.length && (
                          <Text style={styles.photoAddHint}>Add</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedPhotos.length < MIN_REFERENCE_PHOTOS && (
              <Text style={styles.photoRequirement}>
                {MIN_REFERENCE_PHOTOS - selectedPhotos.length} more photo
                {MIN_REFERENCE_PHOTOS - selectedPhotos.length !== 1 ? 's' : ''} needed
              </Text>
            )}
          </Animated.View>

          {/* Privacy reassurance */}
          <View style={styles.privacyBanner}>
            <Text style={styles.privacyText}>
              All face recognition happens on your device using Apple's Vision
              framework. Photos never leave your phone.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {onBack && (
            <Button title="Back" onPress={onBack} variant="ghost" />
          )}
          <View style={styles.continueButton}>
            <Button
              title="Start searching"
              onPress={handleContinue}
              disabled={!isValid}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textInput: {
    ...typography.body,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  inputError: {
    borderColor: colors.error,
  },
  hint: {
    ...typography.small,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  photoSlot: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  photoSlotFilled: {
    borderColor: colors.secondary[500],
    borderStyle: 'solid',
    backgroundColor: colors.secondary[50],
  },
  photoSlotNext: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoCheckmark: {
    ...typography.h3,
    color: colors.secondary[500],
  },
  photoRemoveHint: {
    ...typography.small,
    color: colors.secondary[600],
    fontSize: 9,
    marginTop: 2,
  },
  photoEmpty: {
    alignItems: 'center',
  },
  photoPlus: {
    ...typography.h2,
    color: colors.neutral[400],
  },
  photoAddHint: {
    ...typography.small,
    color: colors.primary[500],
    fontSize: 10,
  },
  photoRequirement: {
    ...typography.small,
    color: colors.warning,
    marginTop: spacing.sm,
  },
  privacyBanner: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  privacyText: {
    ...typography.small,
    color: colors.primary[700],
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  continueButton: {
    flex: 1,
  },
});

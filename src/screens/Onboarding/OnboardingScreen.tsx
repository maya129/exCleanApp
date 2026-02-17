import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { logger } from '../../utils/logger';
import { Button } from '../../components/ui/Button';

const TAG = 'OnboardingScreen';

type OnboardingStep = 'welcome' | 'identify' | 'photos' | 'ready';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');

  const handleNext = () => {
    const steps: OnboardingStep[] = ['welcome', 'identify', 'photos', 'ready'];
    const currentIndex = steps.indexOf(step);

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      logger.info(TAG, `Moving to step: ${nextStep}`);
      setStep(nextStep);
    } else {
      logger.info(TAG, 'Onboarding complete');
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {step === 'welcome' && <WelcomeStep />}
        {step === 'identify' && <IdentifyStep />}
        {step === 'photos' && <PhotoSelectStep />}
        {step === 'ready' && <ReadyStep />}
      </View>
      <View style={styles.footer}>
        <Button
          title={step === 'ready' ? "Let's begin" : 'Continue'}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

function WelcomeStep() {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>
        Let's make your phone feel like yours again.
      </Text>
      <Text style={styles.subtitle}>
        We'll help you find and protect memories you'd rather not stumble upon.
        You're in control — nothing happens without your say.
      </Text>
    </View>
  );
}

function IdentifyStep() {
  // TODO: Phase 3 — TextInput for name + phone number
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Who are we moving on from?</Text>
      <Text style={styles.subtitle}>
        Enter their name and phone number. This stays on your device — we never
        send it anywhere.
      </Text>
      {/* TODO: Name input */}
      {/* TODO: Phone number input */}
    </View>
  );
}

function PhotoSelectStep() {
  // TODO: Phase 3 — Photo picker for 3-5 reference photos
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Select 3–5 reference photos</Text>
      <Text style={styles.subtitle}>
        Pick a few clear photos of them. This helps our AI recognize their face
        across your library.
      </Text>
      {/* TODO: Photo picker grid */}
    </View>
  );
}

function ReadyStep() {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>You're ready.</Text>
      <Text style={styles.subtitle}>
        Take your time. We'll handle the searching — you decide what stays and
        what goes.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
});

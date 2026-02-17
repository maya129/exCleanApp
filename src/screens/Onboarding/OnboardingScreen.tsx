import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { logger } from '../../utils/logger';
import { Button } from '../../components/ui/Button';

const TAG = 'OnboardingScreen';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingStep = 'welcome' | 'promise' | 'howItWorks' | 'ready';

const STEPS: OnboardingStep[] = ['welcome', 'promise', 'howItWorks', 'ready'];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    logger.info(TAG, 'OnboardingScreen mounted');
  }, []);

  useEffect(() => {
    logger.info(TAG, `Step changed: ${step}`);
  }, [step]);

  const animateTransition = (nextStep: OnboardingStep) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    const currentIndex = STEPS.indexOf(step);
    logger.info(TAG, `User tapped Continue on step: ${step}`);

    if (currentIndex < STEPS.length - 1) {
      animateTransition(STEPS[currentIndex + 1]);
    } else {
      logger.info(TAG, 'Onboarding complete — user proceeding to app');
      onComplete();
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex > 0) {
      logger.info(TAG, `User tapped Back from step: ${step}`);
      animateTransition(STEPS[currentIndex - 1]);
    }
  };

  const currentIndex = STEPS.indexOf(step);
  const isFirstStep = currentIndex === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressContainer}>
        {STEPS.map((s, i) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              i <= currentIndex && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Step content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {step === 'welcome' && <WelcomeStep />}
        {step === 'promise' && <PromiseStep />}
        {step === 'howItWorks' && <HowItWorksStep />}
        {step === 'ready' && <ReadyStep />}
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        {!isFirstStep && (
          <Button title="Back" onPress={handleBack} variant="ghost" />
        )}
        <View style={isFirstStep ? styles.fullWidth : styles.nextButton}>
          <Button
            title={step === 'ready' ? "I'm ready" : 'Continue'}
            onPress={handleNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function WelcomeStep() {
  useEffect(() => {
    logger.info(TAG, 'WelcomeStep mounted');
  }, []);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.heroIcon}>{"~"}</Text>
      <Text style={styles.title}>
        Let's make your phone{'\n'}feel like yours again.
      </Text>
      <Text style={styles.subtitle}>
        Moving on is hard enough without unexpected reminders. We're here to
        help — gently and privately.
      </Text>
    </View>
  );
}

function PromiseStep() {
  useEffect(() => {
    logger.info(TAG, 'PromiseStep mounted');
  }, []);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Our promise to you</Text>
      <View style={styles.promiseList}>
        <PromiseItem text="Everything stays on your device. We can't see your photos or data." />
        <PromiseItem text="Nothing is deleted without your explicit permission." />
        <PromiseItem text="You can restore anything within 7 days." />
        <PromiseItem text="No judgment. Only healing." />
      </View>
    </View>
  );
}

function PromiseItem({ text }: { text: string }) {
  return (
    <View style={styles.promiseItem}>
      <View style={styles.promiseBullet} />
      <Text style={styles.promiseText}>{text}</Text>
    </View>
  );
}

function HowItWorksStep() {
  useEffect(() => {
    logger.info(TAG, 'HowItWorksStep mounted');
  }, []);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>How it works</Text>
      <View style={styles.stepsBreakdown}>
        <StepCard
          number="1"
          title="Tell us who"
          description="Share their name and a few photos so we know who to look for."
        />
        <StepCard
          number="2"
          title="We search"
          description="Our AI scans your photos and calendar — all on your device."
        />
        <StepCard
          number="3"
          title="You decide"
          description="Review each match. Keep, vault, or let go — it's your choice."
        />
      </View>
    </View>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepCardContent}>
        <Text style={styles.stepCardTitle}>{title}</Text>
        <Text style={styles.stepCardDesc}>{description}</Text>
      </View>
    </View>
  );
}

function ReadyStep() {
  useEffect(() => {
    logger.info(TAG, 'ReadyStep mounted');
  }, []);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.heroIcon}>{"~"}</Text>
      <Text style={styles.title}>You're ready.</Text>
      <Text style={styles.subtitle}>
        Take your time. There's no rush. We'll handle the searching — you decide
        what stays and what goes.
      </Text>
      <View style={styles.reassurance}>
        <Text style={styles.reassuranceText}>
          Everything is private. Everything is reversible.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[200],
  },
  progressDotActive: {
    backgroundColor: colors.primary[500],
    width: 24,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
  },
  heroIcon: {
    ...typography.h1,
    fontSize: 48,
    color: colors.primary[500],
    marginBottom: spacing.lg,
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
    lineHeight: 26,
    paddingHorizontal: spacing.md,
  },
  promiseList: {
    marginTop: spacing.lg,
    width: '100%',
    gap: spacing.md,
  },
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
  },
  promiseBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary[500],
    marginTop: 8,
    marginRight: spacing.md,
  },
  promiseText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 24,
  },
  stepsBreakdown: {
    marginTop: spacing.lg,
    width: '100%',
    gap: spacing.md,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    ...typography.bodyBold,
    color: colors.text.inverse,
    fontSize: 14,
  },
  stepCardContent: {
    flex: 1,
  },
  stepCardTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  stepCardDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  reassurance: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
  },
  reassuranceText: {
    ...typography.caption,
    color: colors.primary[700],
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  fullWidth: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
});

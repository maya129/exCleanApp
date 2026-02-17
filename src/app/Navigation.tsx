import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { ScanScreen } from '../screens/Scan/ScanScreen';
import { ReviewGalleryScreen } from '../screens/Scan/ReviewGalleryScreen';
import { VaultScreen } from '../screens/Vault/VaultScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { TargetSelectionScreen } from '../screens/Onboarding/TargetSelectionScreen';
import { logger } from '../utils/logger';

const TAG = 'Navigation';

export type RootStackParamList = {
  Onboarding: undefined;
  TargetSelection: undefined;
  Dashboard: undefined;
  Scan: undefined;
  ReviewGallery: undefined;
  Vault: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Navigation() {
  // TODO: Phase 1 — determine initial route based on auth state + onboarding completion
  const hasCompletedOnboarding = false;

  logger.info(TAG, `Initial route: ${hasCompletedOnboarding ? 'Dashboard' : 'Onboarding'}`);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasCompletedOnboarding ? 'Dashboard' : 'Onboarding'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding">
          {({ navigation }) => (
            <OnboardingScreen
              onComplete={() => {
                logger.info(TAG, 'Onboarding complete → TargetSelection');
                navigation.navigate('TargetSelection');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="TargetSelection">
          {({ navigation }) => (
            <TargetSelectionScreen
              onComplete={(profile) => {
                logger.info(TAG, 'Target selected → Dashboard');
                // Store profile in scanStore, then proceed
                navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
              }}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Dashboard">
          {({ navigation }) => (
            <DashboardScreen
              onStartScan={() => {
                logger.info(TAG, 'Navigate → Scan');
                navigation.navigate('Scan');
              }}
              onOpenVault={() => {
                logger.info(TAG, 'Navigate → Vault');
                navigation.navigate('Vault');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="Scan"
          component={ScanScreen}
          options={{ gestureEnabled: false }}
        />

        <Stack.Screen name="ReviewGallery">
          {({ navigation }) => (
            <ReviewGalleryScreen
              onComplete={() => {
                logger.info(TAG, 'Review complete → Dashboard');
                navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="Vault"
          component={VaultScreen}
          options={{
            animation: 'fade',
            contentStyle: { backgroundColor: colors.vault.background },
          }}
        />

        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

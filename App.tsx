/**
 * App entry point.
 * Hydration order: load persisted settings → load fonts → render.
 * No splash screen is dismissed until fonts are ready (no FOUT).
 * Zero network calls at startup. SPEC §10, §6.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { SettingsProvider, useSettings } from './src/state/SettingsContext';
import { ThemeProvider } from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';

// Keep the splash visible until we've loaded fonts + settings
SplashScreen.preventAutoHideAsync();

// ─── Inner: needs SettingsProvider above it ───────────────────────────────────

function AppInner() {
  const { settings, isHydrated } = useSettings();

  const [fontsLoaded, fontError] = useFonts({
    'Amiri-Regular': require('./src/assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('./src/assets/fonts/Amiri-Bold.ttf'),
  });

  const isReady = isHydrated && (fontsLoaded || !!fontError);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <ThemeProvider theme={settings.theme} fontScale={settings.fontScale}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </ThemeProvider>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AppInner />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

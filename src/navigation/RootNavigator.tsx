/**
 * Single native stack navigator. Five routes. No nested navigators.
 * Back behaviour: Reading → NameDetail → NamesList → exit.
 * STRUCTURE §1, SPEC §4.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useTheme } from '../theme/ThemeProvider';

import NamesListScreen from '../screens/NamesListScreen';
import NameDetailScreen from '../screens/NameDetailScreen';
import ReadingScreen from '../screens/ReadingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="NamesList"
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="NamesList"
        component={NamesListScreen}
        options={{ title: 'The Beautiful Names' }}
      />
      <Stack.Screen
        name="NameDetail"
        component={NameDetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="Reading"
        component={ReadingScreen}
        options={{ title: 'Reading' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About & Sources' }}
      />
    </Stack.Navigator>
  );
}

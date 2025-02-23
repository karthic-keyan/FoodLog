import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const onLayoutRootView = async () => {
    await SplashScreen.hideAsync();
  };

  return (
    <ThemeProvider>
      <NavigationContainer onReady={onLayoutRootView}>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
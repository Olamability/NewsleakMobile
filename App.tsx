import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from './src/lib/notifications';
import { startGlobalScheduler, stopGlobalScheduler } from './src/utils/scheduler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Register for push notifications (gracefully handles Expo Go)
    registerForPushNotificationsAsync().catch((error) => {
      // Silently handle notification registration errors
      // The function already logs appropriate warnings
    });

    const cleanup = setupNotificationListeners(
      (notification) => {
        console.warn('Notification received:', notification);
      },
      (response) => {
        console.warn('Notification tapped:', response);
      }
    );

    return cleanup;
  }, []);

  useEffect(() => {
    // Start realtime RSS ingestion scheduler
    console.warn('Starting realtime RSS ingestion scheduler...');
    startGlobalScheduler();

    // Cleanup: stop scheduler when app unmounts
    return () => {
      console.warn('Stopping realtime RSS ingestion scheduler...');
      stopGlobalScheduler();
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <StatusBar style="auto" />
              <AppNavigator />
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

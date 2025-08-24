import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/store/auth';
import LoadingScreen from '@/components/LoadingScreen';

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.status === 'blocked') {
        router.replace('/blocked');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, user, loading]);

  if (loading) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="blocked" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="confirmation" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
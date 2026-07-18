import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

// Cegah splash screen bawaan Expo hilang otomatis sebelum kita siap
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Tempat ideal untuk: cek koneksi Supabase awal, preload data ringan, dll
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    // Splash screen kustom (brand moment), tampil sebelum konten utama render
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <Text className="text-3xl font-semibold text-white">🐔 Ayam Segar</Text>
        <Text className="mt-2 text-sm text-white/80">Kelola pesanan jadi lebih mudah</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}

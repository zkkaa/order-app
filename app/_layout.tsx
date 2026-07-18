import '../global.css';
import { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Cegah splash screen bawaan Expo hilang otomatis sebelum kita siap
SplashScreen.preventAutoHideAsync();

function SplashKustom() {
  const fade = useRef(new Animated.Value(0)).current;
  const naik = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(naik, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [fade, naik]);

  return (
    <View className="flex-1 items-center justify-center bg-brand">
      <Animated.View
        style={{ opacity: fade, transform: [{ translateY: naik }] }}
        className="items-center"
      >
        <View className="w-16 h-16 rounded-2xl bg-white/15 items-center justify-center mb-4">
          <Ionicons name="storefront-outline" size={30} color="white" />
        </View>
        <Text className="text-2xl font-semibold text-white">Ayam Segar</Text>
        <Text className="mt-1.5 text-sm text-white/70">Kelola pesanan jadi lebih mudah</Text>
      </Animated.View>
    </View>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Tempat ideal untuk: cek koneksi Supabase awal, preload data ringan, dll
        await new Promise((resolve) => setTimeout(resolve, 1100));
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    return <SplashKustom />;
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
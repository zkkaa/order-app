import '../global.css';
import { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, Animated, Image } from 'react-native';
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
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#E0F7E9' }}>
      <Animated.View
        style={{ opacity: fade, transform: [{ translateY: naik }] }}
        className="items-center"
      >
        <Image
          source={require('../assets/splash-icon.png')}
          style={{ width: 120, height: 120, marginBottom: 16 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-semibold text-ink">Notaku</Text>
        <Text className="mt-1.5 text-sm text-ink-soft">Kelola pesanan jadi lebih mudah</Text>
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
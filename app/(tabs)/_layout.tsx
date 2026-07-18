import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home-outline',
  pesanan: 'receipt-outline',
  barang: 'cube-outline',
  laporan: 'bar-chart-outline',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0F6E56',
        tabBarInactiveTintColor: '#A6A9A5',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 8,
          shadowOpacity: 0.06,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="pesanan" options={{ title: 'Pesanan' }} />
      <Tabs.Screen name="barang" options={{ title: 'Barang' }} />
      <Tabs.Screen name="laporan" options={{ title: 'Laporan' }} />
    </Tabs>
  );
}

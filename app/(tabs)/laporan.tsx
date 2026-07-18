import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LaporanScreen() {
  return (
    <SafeAreaView className="flex-1 bg-canvas items-center justify-center" edges={['top']}>
      <Text className="text-ink-soft">Halaman laporan omzet — segera dibangun</Text>
    </SafeAreaView>
  );
}

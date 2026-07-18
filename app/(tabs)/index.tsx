import { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { formatRupiah } from '../../lib/format';

interface Ringkasan {
  belumBayar: number;
  dalamPengantaran: number;
  omzetKotorHariIni: number;
  omzetBersihHariIni: number;
}

export default function BerandaScreen() {
  const router = useRouter();
  const [ringkasan, setRingkasan] = useState<Ringkasan>({
    belumBayar: 0,
    dalamPengantaran: 0,
    omzetKotorHariIni: 0,
    omzetBersihHariIni: 0,
  });
  const [loading, setLoading] = useState(true);

  const muatData = useCallback(async () => {
    setLoading(true);

    const awalHariIni = new Date();
    awalHariIni.setHours(0, 0, 0, 0);

    const [{ count: belumBayar }, { count: dalamPengantaran }, { data: lunasHariIni }] =
      await Promise.all([
        supabase
          .from('pesanan')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'belum_bayar'),
        supabase
          .from('pesanan')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'dalam_pengantaran'),
        supabase
          .from('pesanan')
          .select('total_jual, total_modal')
          .eq('status', 'lunas')
          .gte('updated_at', awalHariIni.toISOString()),
      ]);

    const omzetKotorHariIni = (lunasHariIni ?? []).reduce((acc, p) => acc + Number(p.total_jual), 0);
    const omzetBersihHariIni = (lunasHariIni ?? []).reduce(
      (acc, p) => acc + (Number(p.total_jual) - Number(p.total_modal)),
      0
    );

    setRingkasan({
      belumBayar: belumBayar ?? 0,
      dalamPengantaran: dalamPengantaran ?? 0,
      omzetKotorHariIni,
      omzetBersihHariIni,
    });
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData])
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView
        className="flex-1 px-5"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={muatData} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="mt-4 mb-6">
          <Text className="text-sm text-ink-soft">Selamat datang kembali</Text>
          <Text className="text-2xl font-semibold text-ink">Ringkasan hari ini</Text>
        </View>

        {/* Kartu status pesanan */}
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={() => router.push('/pesanan?status=belum_bayar')}
            className="flex-1 bg-surface rounded-card p-4 border border-black/5 active:opacity-70"
          >
            <View className="w-9 h-9 rounded-full bg-status-belumBg items-center justify-center mb-3">
              <Ionicons name="time-outline" size={18} color="#A32D2D" />
            </View>
            <Text className="text-2xl font-semibold text-ink">{ringkasan.belumBayar}</Text>
            <Text className="text-xs text-ink-soft mt-1">Belum bayar</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/pesanan?status=dalam_pengantaran')}
            className="flex-1 bg-surface rounded-card p-4 border border-black/5 active:opacity-70"
          >
            <View className="w-9 h-9 rounded-full bg-status-prosesBg items-center justify-center mb-3">
              <Ionicons name="bicycle-outline" size={18} color="#854F0B" />
            </View>
            <Text className="text-2xl font-semibold text-ink">{ringkasan.dalamPengantaran}</Text>
            <Text className="text-xs text-ink-soft mt-1">Dalam pengantaran</Text>
          </Pressable>
        </View>

        {/* Kartu omzet hari ini */}
        <View className="bg-brand rounded-card p-5 mb-6">
          <Text className="text-xs text-white/70 mb-1">Omzet hari ini (lunas)</Text>
          <Text className="text-3xl font-semibold text-white">
            {formatRupiah(ringkasan.omzetKotorHariIni)}
          </Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="trending-up-outline" size={14} color="#E1F5EE" />
            <Text className="text-xs text-brand-light ml-1">
              Bersih {formatRupiah(ringkasan.omzetBersihHariIni)}
            </Text>
          </View>
        </View>

        {/* Aksi cepat */}
        <Pressable
          onPress={() => router.push('/pesanan/tambah')}
          className="bg-ink rounded-pill py-4 items-center flex-row justify-center gap-2 active:opacity-80"
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white font-medium">Buat pesanan baru</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

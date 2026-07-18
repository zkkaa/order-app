import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { formatRupiah, formatTanggal } from '../../lib/format';

type PeriodeKey = 'harian' | 'mingguan' | 'bulanan' | 'tahunan';

const PERIODE_OPTIONS: { key: PeriodeKey; label: string }[] = [
  { key: 'harian', label: 'Hari ini' },
  { key: 'mingguan', label: 'Minggu ini' },
  { key: 'bulanan', label: 'Bulan ini' },
  { key: 'tahunan', label: 'Tahun ini' },
];

interface BarisLaporan {
  pesanan_id: string;
  nomor_pesanan: string;
  nama_pembeli: string;
  omzet_kotor: number;
  omzet_bersih: number;
  modal: number;
  tanggal_lunas: string;
}

function awalPeriode(key: PeriodeKey): Date {
  const now = new Date();
  if (key === 'harian') {
    now.setHours(0, 0, 0, 0);
    return now;
  }
  if (key === 'mingguan') {
    const hari = now.getDay(); // 0 = Minggu
    const selisih = now.getDate() - hari + (hari === 0 ? -6 : 1); // mulai Senin
    const d = new Date(now);
    d.setDate(selisih);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (key === 'bulanan') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(now.getFullYear(), 0, 1); // tahunan
}

export default function LaporanScreen() {
  const [periode, setPeriode] = useState<PeriodeKey>('harian');
  const [data, setData] = useState<BarisLaporan[]>([]);
  const [loading, setLoading] = useState(true);

  const muatData = useCallback(async (p: PeriodeKey) => {
    setLoading(true);
    const { data: hasil, error } = await supabase
      .from('laporan_omzet')
      .select('*')
      .gte('tanggal_lunas', awalPeriode(p).toISOString())
      .order('tanggal_lunas', { ascending: false });

    if (!error && hasil) setData(hasil as BarisLaporan[]);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData(periode);
    }, [muatData, periode])
  );

  const ringkasan = useMemo(() => {
    const kotor = data.reduce((acc, d) => acc + Number(d.omzet_kotor), 0);
    const bersih = data.reduce((acc, d) => acc + Number(d.omzet_bersih), 0);
    const modal = data.reduce((acc, d) => acc + Number(d.modal), 0);
    return { kotor, bersih, modal, jumlahPesanan: data.length };
  }, [data]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-ink mb-3">Laporan</Text>

        <FlatList
          horizontal
          data={PERIODE_OPTIONS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="w-2" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setPeriode(item.key)}
              className={`px-4 py-2 rounded-pill border ${
                periode === item.key ? 'bg-ink border-ink' : 'bg-surface border-black/10'
              }`}
            >
              <Text className={periode === item.key ? 'text-white text-sm' : 'text-ink-soft text-sm'}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.pesanan_id}
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => muatData(periode)} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          <View className="mb-4">
            <View className="bg-brand rounded-card p-5 mb-3">
              <Text className="text-xs text-white/70 mb-1">Omzet kotor</Text>
              <Text className="text-3xl font-semibold text-white mb-3">
                {formatRupiah(ringkasan.kotor)}
              </Text>
              <View className="flex-row items-center justify-between pt-3 border-t border-white/20">
                <View>
                  <Text className="text-[11px] text-white/70">Bersih</Text>
                  <Text className="text-sm font-medium text-brand-light">
                    {formatRupiah(ringkasan.bersih)}
                  </Text>
                </View>
                <View>
                  <Text className="text-[11px] text-white/70">Modal</Text>
                  <Text className="text-sm font-medium text-white/90">
                    {formatRupiah(ringkasan.modal)}
                  </Text>
                </View>
                <View>
                  <Text className="text-[11px] text-white/70">Pesanan lunas</Text>
                  <Text className="text-sm font-medium text-white/90">
                    {ringkasan.jumlahPesanan}
                  </Text>
                </View>
              </View>
            </View>
            <Text className="text-sm text-ink-soft">Rincian transaksi</Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center mt-10">
              <Text className="text-ink-soft">Belum ada transaksi lunas di periode ini</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View className="bg-surface rounded-card p-4 border border-black/5">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs text-ink-faint">{item.nomor_pesanan}</Text>
              <Text className="text-xs text-ink-faint">{formatTanggal(item.tanggal_lunas)}</Text>
            </View>
            <Text className="text-base font-medium text-ink mb-1">{item.nama_pembeli}</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="trending-up-outline" size={13} color="#3B6D11" />
                <Text className="text-xs text-status-lunas ml-1">
                  Bersih {formatRupiah(item.omzet_bersih)}
                </Text>
              </View>
              <Text className="text-sm font-medium text-ink">{formatRupiah(item.omzet_kotor)}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
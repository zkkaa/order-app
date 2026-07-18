import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { formatRupiah, formatTanggal } from '../../lib/format';
import { STATUS_CONFIG, type Pesanan, type StatusPesanan } from '../../lib/types';

const FILTER_OPTIONS: { key: StatusPesanan | 'semua'; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'belum_bayar', label: 'Belum bayar' },
  { key: 'dalam_pengantaran', label: 'Pengantaran' },
  { key: 'lunas', label: 'Lunas' },
];

export default function PesananScreen() {
  const router = useRouter();
  const [semuaPesanan, setSemuaPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [pencarian, setPencarian] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusPesanan | 'semua'>('semua');

  const muatData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pesanan')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setSemuaPesanan(data as Pesanan[]);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData])
  );

  const dataTersaring = useMemo(() => {
    return semuaPesanan.filter((p) => {
      if (filterStatus !== 'semua' && p.status !== filterStatus) return false;
      if (
        pencarian.trim() &&
        !p.nama_pembeli.toLowerCase().includes(pencarian.trim().toLowerCase()) &&
        !p.nomor_pesanan.toLowerCase().includes(pencarian.trim().toLowerCase())
      )
        return false;
      return true;
    });
  }, [semuaPesanan, pencarian, filterStatus]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-ink mb-3">Pesanan</Text>

        <View className="flex-row items-center bg-surface rounded-2xl border border-black/10 px-4 py-3 mb-3">
          <Ionicons name="search-outline" size={18} color="#A6A9A5" />
          <TextInput
            placeholder="Cari nama pembeli atau no. pesanan"
            placeholderTextColor="#A6A9A5"
            value={pencarian}
            onChangeText={setPencarian}
            className="flex-1 ml-2 text-ink"
          />
        </View>

        <FlatList
          horizontal
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="w-2" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setFilterStatus(item.key)}
              className={`px-4 py-2 rounded-pill border ${
                filterStatus === item.key ? 'bg-ink border-ink' : 'bg-surface border-black/10'
              }`}
            >
              <Text className={filterStatus === item.key ? 'text-white text-sm' : 'text-ink-soft text-sm'}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={dataTersaring}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={muatData} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center mt-16">
              <Text className="text-ink-soft">Belum ada pesanan</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <Pressable
              onPress={() => router.push(`/pesanan/${item.id}`)}
              className="bg-surface rounded-card p-4 border border-black/5 active:opacity-70"
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-ink-faint">{item.nomor_pesanan}</Text>
                <View style={{ backgroundColor: cfg.bg }} className="px-2.5 py-1 rounded-pill">
                  <Text style={{ color: cfg.text }} className="text-[11px] font-medium">
                    {cfg.label}
                  </Text>
                </View>
              </View>
              <Text className="text-base font-medium text-ink">{item.nama_pembeli}</Text>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-ink-faint">{formatTanggal(item.created_at)}</Text>
                <Text className="text-sm font-medium text-ink">
                  {formatRupiah(item.total_jual)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={() => router.push('/pesanan/tambah')}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-ink items-center justify-center shadow-lg active:opacity-80"
      >
        <Ionicons name="add" size={26} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}
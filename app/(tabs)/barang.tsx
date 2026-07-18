import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { formatRupiah } from '../../lib/format';
import type { Barang } from '../../lib/types';

export default function BarangScreen() {
  const router = useRouter();
  const [semuaBarang, setSemuaBarang] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [pencarian, setPencarian] = useState('');
  const [tampilkanNonaktif, setTampilkanNonaktif] = useState(false);

  const muatData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('barang')
      .select('*')
      .order('nama', { ascending: true });

    if (!error && data) setSemuaBarang(data as Barang[]);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData])
  );

  const barangTersaring = useMemo(() => {
    return semuaBarang.filter((b) => {
      if (!tampilkanNonaktif && !b.is_active) return false;
      if (pencarian.trim() && !b.nama.toLowerCase().includes(pencarian.trim().toLowerCase()))
        return false;
      return true;
    });
  }, [semuaBarang, pencarian, tampilkanNonaktif]);

  const toggleAktif = async (barang: Barang) => {
    setSemuaBarang((prev) =>
      prev.map((b) => (b.id === barang.id ? { ...b, is_active: !b.is_active } : b))
    );
    const { error } = await supabase
      .from('barang')
      .update({ is_active: !barang.is_active })
      .eq('id', barang.id);
    if (error) {
      setSemuaBarang((prev) =>
        prev.map((b) => (b.id === barang.id ? { ...b, is_active: barang.is_active } : b))
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-ink mb-3">Barang</Text>

        <View className="flex-row items-center bg-surface rounded-2xl border border-black/10 px-4 py-3 mb-3">
          <Ionicons name="search-outline" size={18} color="#A6A9A5" />
          <TextInput
            placeholder="Cari nama barang"
            placeholderTextColor="#A6A9A5"
            value={pencarian}
            onChangeText={setPencarian}
            className="flex-1 ml-2 text-ink"
          />
        </View>

        <Pressable
          onPress={() => setTampilkanNonaktif((v) => !v)}
          className="flex-row items-center self-start"
        >
          <Ionicons
            name={tampilkanNonaktif ? 'checkbox' : 'square-outline'}
            size={18}
            color="#0F6E56"
          />
          <Text className="text-sm text-ink-soft ml-2">Tampilkan barang nonaktif</Text>
        </Pressable>
      </View>

      <FlatList
        data={barangTersaring}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={muatData} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center mt-16">
              <Text className="text-ink-soft">Belum ada barang</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/barang/${item.id}`)}
            className="bg-surface rounded-card p-4 border border-black/5 active:opacity-70"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-medium text-ink">{item.nama}</Text>
                  {!item.is_active && (
                    <View className="bg-ink/10 px-2 py-0.5 rounded-pill">
                      <Text className="text-[11px] text-ink-soft">Nonaktif</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-ink-soft mt-1">
                  {formatRupiah(item.harga_jual)} / {item.satuan}
                </Text>
                <Text className="text-xs text-ink-faint mt-0.5">
                  Modal {formatRupiah(item.harga_modal)} / {item.satuan}
                </Text>
              </View>
              <Pressable
                onPress={() => toggleAktif(item)}
                hitSlop={8}
                className="w-9 h-9 rounded-full bg-canvas items-center justify-center"
              >
                <Ionicons
                  name={item.is_active ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#6B6F6C"
                />
              </Pressable>
            </View>
          </Pressable>
        )}
      />

      <Pressable
        onPress={() => router.push('/barang/tambah')}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-ink items-center justify-center shadow-lg active:opacity-80"
      >
        <Ionicons name="add" size={26} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}

import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { formatRupiah, formatTanggal } from '../../lib/format';
import { STATUS_CONFIG, type Pesanan, type StatusPesanan } from '../../lib/types';

export default function DetailPesananScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);
  const [loading, setLoading] = useState(true);
  const [memproses, setMemproses] = useState(false);

  const muatData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pesanan')
      .select('*, pesanan_item(*)')
      .eq('id', id)
      .single();
    if (!error && data) setPesanan(data as Pesanan);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData])
  );

  const ubahStatus = async (statusBaru: StatusPesanan) => {
    setMemproses(true);
    const { error } = await supabase
      .from('pesanan')
      .update({ status: statusBaru })
      .eq('id', id);
    setMemproses(false);
    if (error) {
      Alert.alert('Gagal mengubah status', error.message);
      return;
    }
    muatData();
  };

  const konfirmasiUbahStatus = (statusBaru: StatusPesanan, judul: string, pesan: string) => {
    Alert.alert(judul, pesan, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Ya, lanjutkan', onPress: () => ubahStatus(statusBaru) },
    ]);
  };

  const hapusPesanan = () => {
    Alert.alert(
      'Hapus pesanan ini?',
      'Pesanan yang sudah lunas ini akan dihapus permanen dan tidak bisa dikembalikan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setMemproses(true);
            const { error } = await supabase.from('pesanan').delete().eq('id', id);
            setMemproses(false);
            if (error) {
              Alert.alert('Gagal menghapus', error.message);
              return;
            }
            router.back();
          },
        },
      ]
    );
  };

  if (loading || !pesanan) {
    return (
      <SafeAreaView className="flex-1 bg-canvas items-center justify-center">
        <ActivityIndicator color="#0F6E56" />
      </SafeAreaView>
    );
  }

  const cfg = STATUS_CONFIG[pesanan.status];
  const items = pesanan.pesanan_item ?? [];

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#1F2320" />
          </Pressable>
          <Text className="text-xl font-semibold text-ink">Detail pesanan</Text>
        </View>
        {pesanan.status !== 'lunas' && (
          <Pressable onPress={() => router.push(`/pesanan/edit/${pesanan.id}`)} hitSlop={8}>
            <Ionicons name="create-outline" size={22} color="#6B6F6C" />
          </Pressable>
        )}
      </View>

      <ScrollView className="flex-1 px-5 pt-2" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-surface rounded-card p-5 border border-black/5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-ink-faint">{pesanan.nomor_pesanan}</Text>
            <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1 rounded-pill">
              <Text style={{ color: cfg.text }} className="text-xs font-medium">
                {cfg.label}
              </Text>
            </View>
          </View>
          <Text className="text-xl font-semibold text-ink">{pesanan.nama_pembeli}</Text>
          <Text className="text-xs text-ink-faint mt-1">{formatTanggal(pesanan.created_at)}</Text>
          {pesanan.catatan ? (
            <View className="bg-canvas rounded-xl px-3 py-2 mt-3">
              <Text className="text-xs text-ink-soft">Catatan: {pesanan.catatan}</Text>
            </View>
          ) : null}
        </View>

        <Text className="text-sm text-ink-soft mb-2">Barang dipesan</Text>
        <View className="bg-surface rounded-card border border-black/5 mb-4">
          {items.map((item, idx) => (
            <View
              key={item.id}
              className={`flex-row items-center justify-between px-4 py-3 ${idx !== items.length - 1 ? 'border-b border-black/5' : ''
                }`}
            >
              <View className="flex-1 pr-2">
                <Text className="text-ink text-sm font-medium">{item.nama_barang_saat_itu}</Text>
                <Text className="text-ink-faint text-xs">
                  {item.qty} {item.satuan_saat_itu} × {formatRupiah(item.harga_jual_saat_itu)}
                </Text>
              </View>
              <Text className="text-ink text-sm font-medium">
                {formatRupiah(item.subtotal_jual)}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row items-center justify-between bg-brand rounded-card px-5 py-4 mb-6">
          <Text className="text-white/80 text-sm">Total</Text>
          <Text className="text-white text-lg font-semibold">
            {formatRupiah(pesanan.total_jual)}
          </Text>
        </View>

        {memproses ? (
          <ActivityIndicator color="#0F6E56" />
        ) : (
          <>
            {pesanan.status === 'belum_bayar' && (
              <Pressable
                onPress={() =>
                  konfirmasiUbahStatus(
                    'dalam_pengantaran',
                    'Tandai dalam pengantaran?',
                    'Status pesanan akan berubah dari Belum bayar ke Dalam pengantaran.'
                  )
                }
                className="bg-ink rounded-pill py-4 items-center active:opacity-80"
              >
                <Text className="text-white font-medium">Tandai dalam pengantaran</Text>
              </Pressable>
            )}

            {pesanan.status === 'dalam_pengantaran' && (
              <Pressable
                onPress={() =>
                  konfirmasiUbahStatus(
                    'lunas',
                    'Tandai lunas?',
                    'Status pesanan akan berubah menjadi Lunas dan tidak bisa diedit lagi setelah ini.'
                  )
                }
                className="bg-ink rounded-pill py-4 items-center active:opacity-80"
              >
                <Text className="text-white font-medium">Tandai selesai bayar</Text>
              </Pressable>
            )}

            {pesanan.status === 'lunas' && (
              <Pressable
                onPress={hapusPesanan}
                className="bg-status-belumBg rounded-pill py-4 items-center active:opacity-80"
              >
                <Text className="text-status-belum font-medium">Hapus pesanan</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { formatRupiah } from '../../lib/format';
import { Field } from '../../components/Field';
import type { Barang } from '../../lib/types';

interface ItemKeranjang {
  barang: Barang;
  qty: string;
}

export default function TambahPesananScreen() {
  const router = useRouter();
  const [namaPembeli, setNamaPembeli] = useState('');
  const [catatan, setCatatan] = useState('');
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [barangAktif, setBarangAktif] = useState<Barang[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('barang')
        .select('*')
        .eq('is_active', true)
        .order('nama', { ascending: true });
      if (data) setBarangAktif(data as Barang[]);
    })();
  }, []);

  const tambahKeKeranjang = (barang: Barang) => {
    setPickerVisible(false);
    setKeranjang((prev) => {
      const sudahAda = prev.find((k) => k.barang.id === barang.id);
      if (sudahAda) {
        return prev.map((k) =>
          k.barang.id === barang.id ? { ...k, qty: String(Number(k.qty || '0') + 1) } : k
        );
      }
      return [...prev, { barang, qty: '1' }];
    });
  };

  const ubahQty = (barangId: string, qty: string) => {
    setKeranjang((prev) => prev.map((k) => (k.barang.id === barangId ? { ...k, qty } : k)));
  };

  const hapusDariKeranjang = (barangId: string) => {
    setKeranjang((prev) => prev.filter((k) => k.barang.id !== barangId));
  };

  const total = keranjang.reduce((acc, k) => acc + Number(k.qty || 0) * k.barang.harga_jual, 0);

  const simpan = async () => {
    setError('');
    if (!namaPembeli.trim()) {
      setError('Nama pembeli wajib diisi');
      return;
    }
    if (keranjang.length === 0) {
      setError('Tambahkan minimal satu barang');
      return;
    }
    if (keranjang.some((k) => !k.qty || Number(k.qty) <= 0)) {
      setError('Jumlah (qty) semua barang harus lebih dari 0');
      return;
    }

    setSaving(true);

    const { data: pesananBaru, error: errPesanan } = await supabase
      .from('pesanan')
      .insert({ nama_pembeli: namaPembeli.trim(), catatan: catatan.trim() || null })
      .select()
      .single();

    if (errPesanan || !pesananBaru) {
      setSaving(false);
      Alert.alert('Gagal menyimpan pesanan', errPesanan?.message ?? 'Terjadi kesalahan');
      return;
    }

    const itemRows = keranjang.map((k) => ({
      pesanan_id: pesananBaru.id,
      barang_id: k.barang.id,
      nama_barang_saat_itu: k.barang.nama,
      satuan_saat_itu: k.barang.satuan,
      qty: Number(k.qty),
      harga_jual_saat_itu: k.barang.harga_jual,
      harga_modal_saat_itu: k.barang.harga_modal,
    }));

    const { error: errItem } = await supabase.from('pesanan_item').insert(itemRows);

    if (errItem) {
      // Rollback: hapus pesanan yang sudah terlanjur dibuat karena barangnya gagal disimpan
      await supabase.from('pesanan').delete().eq('id', pesananBaru.id);
      setSaving(false);
      Alert.alert('Gagal menyimpan barang pesanan', errItem.message);
      return;
    }

    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#1F2320" />
        </Pressable>
        <Text className="text-xl font-semibold text-ink">Pesanan baru</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" keyboardShouldPersistTaps="handled">
        <Field
          label="Nama pembeli"
          placeholder="Contoh: Bu Siti"
          value={namaPembeli}
          onChangeText={setNamaPembeli}
        />

        <Text className="text-sm text-ink-soft mb-1.5">Barang dipesan</Text>
        <View className="bg-surface rounded-card border border-black/5 p-2 mb-2">
          {keranjang.length === 0 ? (
            <Text className="text-ink-faint text-sm py-4 text-center">
              Belum ada barang ditambahkan
            </Text>
          ) : (
            keranjang.map((k) => (
              <View
                key={k.barang.id}
                className="flex-row items-center py-2.5 px-2 border-b border-black/5"
              >
                <View className="flex-1">
                  <Text className="text-ink text-sm font-medium">{k.barang.nama}</Text>
                  <Text className="text-ink-faint text-xs">
                    {formatRupiah(k.barang.harga_jual)} / {k.barang.satuan}
                  </Text>
                </View>
                <TextInput
                  value={k.qty}
                  onChangeText={(v) => ubahQty(k.barang.id, v)}
                  keyboardType="numeric"
                  className="w-16 text-center bg-canvas rounded-lg py-2 text-ink mr-2"
                />
                <Text className="w-24 text-right text-sm text-ink font-medium mr-2">
                  {formatRupiah(Number(k.qty || 0) * k.barang.harga_jual)}
                </Text>
                <Pressable onPress={() => hapusDariKeranjang(k.barang.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color="#A32D2D" />
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Pressable
          onPress={() => setPickerVisible(true)}
          className="flex-row items-center justify-center border border-dashed border-black/20 rounded-2xl py-3 mb-4 active:opacity-70"
        >
          <Ionicons name="add" size={16} color="#0F6E56" />
          <Text className="text-brand text-sm font-medium ml-1">Tambah barang</Text>
        </Pressable>

        <Field
          label="Catatan (opsional)"
          placeholder="Contoh: potong kecil-kecil"
          value={catatan}
          onChangeText={setCatatan}
          multiline
        />

        <View className="flex-row items-center justify-between bg-brand rounded-card px-5 py-4 mb-2">
          <Text className="text-white/80 text-sm">Total pesanan</Text>
          <Text className="text-white text-lg font-semibold">{formatRupiah(total)}</Text>
        </View>

        {error ? <Text className="text-status-belum text-sm mb-2">{error}</Text> : null}

        <Pressable
          onPress={simpan}
          disabled={saving}
          className="bg-ink rounded-pill py-4 items-center mt-2 mb-10 active:opacity-80"
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-medium">Simpan pesanan</Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal visible={pickerVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-canvas">
          <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
            <Text className="text-lg font-semibold text-ink">Pilih barang</Text>
            <Pressable onPress={() => setPickerVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={22} color="#1F2320" />
            </Pressable>
          </View>
          <FlatList
            data={barangAktif}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingTop: 8 }}
            ItemSeparatorComponent={() => <View className="h-2" />}
            ListEmptyComponent={
              <Text className="text-ink-soft text-center mt-10">
                Belum ada barang aktif. Tambahkan dulu di tab Barang.
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => tambahKeKeranjang(item)}
                className="bg-surface rounded-card p-4 border border-black/5 flex-row justify-between items-center active:opacity-70"
              >
                <View>
                  <Text className="text-ink font-medium">{item.nama}</Text>
                  <Text className="text-ink-faint text-xs mt-0.5">
                    {formatRupiah(item.harga_jual)} / {item.satuan}
                  </Text>
                </View>
                <Ionicons name="add-circle-outline" size={22} color="#0F6E56" />
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
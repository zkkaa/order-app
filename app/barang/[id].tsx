import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Field } from '../../components/Field';
import type { Barang } from '../../lib/types';

export default function EditBarangScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [barang, setBarang] = useState<Barang | null>(null);

  const [nama, setNama] = useState('');
  const [satuan, setSatuan] = useState('');
  const [hargaModal, setHargaModal] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('barang').select('*').eq('id', id).single();
      if (!error && data) {
        setBarang(data as Barang);
        setNama(data.nama);
        setSatuan(data.satuan);
        setHargaModal(String(data.harga_modal));
        setHargaJual(String(data.harga_jual));
      }
      setLoading(false);
    })();
  }, [id]);

  const validasi = () => {
    const e: Record<string, string> = {};
    if (!nama.trim()) e.nama = 'Nama barang wajib diisi';
    if (!satuan.trim()) e.satuan = 'Satuan wajib diisi';
    if (!hargaJual || isNaN(Number(hargaJual))) e.hargaJual = 'Harga jual wajib angka';
    if (!hargaModal || isNaN(Number(hargaModal))) e.hargaModal = 'Harga modal wajib angka';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const simpan = async () => {
    if (!validasi()) return;
    setSaving(true);
    const { error } = await supabase
      .from('barang')
      .update({
        nama: nama.trim(),
        satuan: satuan.trim(),
        harga_modal: Number(hargaModal),
        harga_jual: Number(hargaJual),
      })
      .eq('id', id);
    setSaving(false);

    if (error) {
      Alert.alert('Gagal menyimpan', error.message);
      return;
    }
    router.back();
  };

  const toggleAktif = () => {
    if (!barang) return;
    const aksi = barang.is_active ? 'nonaktifkan' : 'aktifkan';
    Alert.alert(
      `Yakin ingin ${aksi} barang ini?`,
      barang.is_active
        ? 'Barang tidak akan muncul lagi sebagai pilihan saat membuat pesanan baru. Riwayat pesanan lama tetap aman.'
        : 'Barang akan muncul kembali sebagai pilihan saat membuat pesanan baru.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: aksi === 'nonaktifkan' ? 'Nonaktifkan' : 'Aktifkan',
          style: aksi === 'nonaktifkan' ? 'destructive' : 'default',
          onPress: async () => {
            const { error } = await supabase
              .from('barang')
              .update({ is_active: !barang.is_active })
              .eq('id', id);
            if (!error) {
              setBarang({ ...barang, is_active: !barang.is_active });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-canvas items-center justify-center">
        <ActivityIndicator color="#0F6E56" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#1F2320" />
          </Pressable>
          <Text className="text-xl font-semibold text-ink">Edit barang</Text>
        </View>
        <Pressable onPress={toggleAktif} hitSlop={8}>
          <Ionicons
            name={barang?.is_active ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color="#6B6F6C"
          />
        </Pressable>
      </View>

      {!barang?.is_active && (
        <View className="mx-5 mb-2 bg-status-belumBg rounded-2xl px-4 py-2.5">
          <Text className="text-xs text-status-belum">
            Barang ini nonaktif — tidak muncul sebagai pilihan pesanan baru
          </Text>
        </View>
      )}

      <ScrollView className="flex-1 px-5 pt-2" keyboardShouldPersistTaps="handled">
        <Field label="Nama barang" value={nama} onChangeText={setNama} error={errors.nama} />
        <Field label="Satuan" value={satuan} onChangeText={setSatuan} error={errors.satuan} />
        <Field
          label="Harga modal"
          keyboardType="numeric"
          prefix="Rp"
          value={hargaModal}
          onChangeText={setHargaModal}
          error={errors.hargaModal}
        />
        <Field
          label="Harga jual"
          keyboardType="numeric"
          prefix="Rp"
          value={hargaJual}
          onChangeText={setHargaJual}
          error={errors.hargaJual}
        />

        <Text className="text-xs text-ink-faint mb-4 -mt-2">
          Perubahan harga di sini tidak mengubah harga di pesanan-pesanan yang sudah pernah dibuat
          sebelumnya.
        </Text>

        <Pressable
          onPress={simpan}
          disabled={saving}
          className="bg-ink rounded-pill py-4 items-center mt-2 mb-4 active:opacity-80"
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-medium">Simpan perubahan</Text>
          )}
        </Pressable>

        <Pressable onPress={toggleAktif} className="items-center py-2 mb-10 active:opacity-70">
          <Text className="text-sm text-status-belum">
            {barang?.is_active ? 'Nonaktifkan barang ini' : 'Aktifkan kembali barang ini'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

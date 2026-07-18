import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Field } from '../../components/Field';

const SATUAN_CEPAT = ['kg', 'ekor', 'pcs', 'liter'];

export default function TambahBarangScreen() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [satuan, setSatuan] = useState('kg');
  const [hargaModal, setHargaModal] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

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
    const { error } = await supabase.from('barang').insert({
      nama: nama.trim(),
      satuan: satuan.trim(),
      harga_modal: Number(hargaModal),
      harga_jual: Number(hargaJual),
    });
    setSaving(false);

    if (error) {
      Alert.alert('Gagal menyimpan', error.message);
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#1F2320" />
        </Pressable>
        <Text className="text-xl font-semibold text-ink">Tambah barang</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" keyboardShouldPersistTaps="handled">
        <Field
          label="Nama barang"
          placeholder="Contoh: Kepala ayam"
          value={nama}
          onChangeText={setNama}
          error={errors.nama}
        />

        <Text className="text-sm text-ink-soft mb-1.5">Satuan</Text>
        <View className="flex-row gap-2 mb-1">
          {SATUAN_CEPAT.map((s) => (
            <Pressable
              key={s}
              onPress={() => setSatuan(s)}
              className={`px-4 py-2 rounded-pill border ${
                satuan === s ? 'bg-ink border-ink' : 'bg-surface border-black/10'
              }`}
            >
              <Text className={satuan === s ? 'text-white' : 'text-ink-soft'}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <Field
          label=""
          placeholder="Atau tulis satuan lain"
          value={satuan}
          onChangeText={setSatuan}
          error={errors.satuan}
        />

        <Field
          label="Harga modal"
          placeholder="0"
          keyboardType="numeric"
          prefix="Rp"
          value={hargaModal}
          onChangeText={setHargaModal}
          error={errors.hargaModal}
        />
        <Field
          label="Harga jual"
          placeholder="0"
          keyboardType="numeric"
          prefix="Rp"
          value={hargaJual}
          onChangeText={setHargaJual}
          error={errors.hargaJual}
        />

        <Pressable
          onPress={simpan}
          disabled={saving}
          className="bg-ink rounded-pill py-4 items-center mt-2 mb-10 active:opacity-80"
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-medium">Simpan barang</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

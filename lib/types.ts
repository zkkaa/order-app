export type StatusPesanan = 'belum_bayar' | 'dalam_pengantaran' | 'lunas';

export interface Barang {
  id: string;
  nama: string;
  satuan: string;
  harga_modal: number;
  harga_jual: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PesananItem {
  id: string;
  pesanan_id: string;
  barang_id: string;
  nama_barang_saat_itu: string;
  satuan_saat_itu: string;
  qty: number;
  harga_jual_saat_itu: number;
  harga_modal_saat_itu: number;
  subtotal_jual: number;
  subtotal_modal: number;
  created_at: string;
}

export interface Pesanan {
  id: string;
  nomor_pesanan: string;
  nama_pembeli: string;
  catatan: string | null;
  status: StatusPesanan;
  total_jual: number;
  total_modal: number;
  created_at: string;
  updated_at: string;
  // relasi opsional, di-load lewat join saat butuh detail
  pesanan_item?: PesananItem[];
}

export const STATUS_CONFIG: Record<
  StatusPesanan,
  { label: string; text: string; bg: string }
> = {
  belum_bayar: { label: 'Belum bayar', text: '#A32D2D', bg: '#FCEBEB' },
  dalam_pengantaran: { label: 'Dalam pengantaran', text: '#854F0B', bg: '#FAEEDA' },
  lunas: { label: 'Lunas', text: '#3B6D11', bg: '#EAF3DE' },
};

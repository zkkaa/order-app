export const formatRupiah = (n: number) =>
  'Rp' + Math.round(n).toLocaleString('id-ID', { maximumFractionDigits: 0 });

export const formatTanggal = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
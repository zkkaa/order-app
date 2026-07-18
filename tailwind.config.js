/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Palet warna: clean & elegant, aksen pastel teal + status pesanan
        brand: {
          DEFAULT: '#0F6E56',   // teal gelap - tombol utama, aksen brand
          light: '#E1F5EE',     // teal pastel - background aksen
        },
        status: {
          belum: '#E24B4A',       // merah - belum bayar
          belumBg: '#FCEBEB',
          proses: '#EF9F27',      // amber - dalam pengantaran
          prosesBg: '#FAEEDA',
          lunas: '#639922',       // hijau - lunas
          lunasBg: '#EAF3DE',
        },
        ink: {
          DEFAULT: '#1F2320',   // teks utama
          soft: '#6B6F6C',      // teks sekunder
          faint: '#A6A9A5',     // teks hint
        },
        surface: '#FFFFFF',
        canvas: '#F7F8F6',
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};

# 📄 Dokumentasi Folder `pages`

Folder `pages` berisi seluruh halaman utama aplikasi Next.js. Setiap file `.tsx` di sini otomatis menjadi route URL pada aplikasi.

## Struktur File

- **_app.tsx**  
  Root wrapper untuk semua halaman (global layout, theme, navbar, dsb).

- **_document.tsx**  
  Custom HTML document (head, meta, manifest, dsb).

- **index.tsx**  
  Dashboard utama aplikasi.

- **calculator-investasi.tsx**  
  Kalkulator investasi token.

- **calculator-token.tsx**  
  Kalkulator simulasi profit token.

- **signal-token.tsx**  
  Halaman sinyal token (token yang naik signifikan).

- **OneSignalProvider.tsx**  
  Provider untuk push notification OneSignal.

---

## Penjelasan Tiap File

### _app.tsx
- Mengatur theme (light/dark), bottom navbar, dan global layout.
- Memanggil `OneSignalProvider` untuk notifikasi.
- Menggunakan state untuk theme, navbar visibility, dan efek klik tombol.

### _document.tsx
- Menambahkan manifest, favicon, meta theme-color.
- Inject Bootstrap JS bundle untuk mendukung komponen Bootstrap.

### index.tsx
- Dashboard utama.
- Menampilkan daftar token populer, statistik token, dan grafik harga.
- Fitur pencarian token dan chart menggunakan Chart.js.

### calculator-investasi.tsx
- Kalkulator investasi token.
- Input manual atau fetch harga token dari API.
- Grafik investasi, data historis harga, dan perhitungan profit/loss.
- Fitur copy-paste nilai input, dan chart menggunakan Chart.js.

### calculator-token.tsx
- Kalkulator simulasi profit token.
- Input manual atau fetch harga token dari API.
- Grafik simulasi harga 7 hari, FOMO alert, dan ekspor CSV.
- Fitur copy-paste nilai input, dan chart menggunakan Chart.js.

### signal-token.tsx
- Menampilkan token yang naik signifikan dalam 24 jam.
- Fitur filter, pencarian, dan detail token.

### OneSignalProvider.tsx
- Provider React untuk integrasi push notification OneSignal.

---

## Cara Membaca Kode

1. Mulai dari `_app.tsx` untuk memahami global layout dan provider.
2. Lihat `index.tsx` untuk logika dashboard utama.
3. Baca file kalkulator (`calculator-investasi.tsx` & `calculator-token.tsx`) untuk fitur kalkulasi.
4. Cek `signal-token.tsx` untuk fitur sinyal token.
5. Gunakan `OneSignalProvider.tsx` untuk memahami integrasi notifikasi.

---
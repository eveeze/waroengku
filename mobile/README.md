# Warungku Mobile App (Admin)

Aplikasi mobile untuk manajemen Warungku (Admin/Kasir), dibangun dengan React Native (Expo) dan TypeScript.

## 📱 Cara Menjalankan Aplikasi

### 1. Tanpa Emulator (Android Fisik)

Cara termudah jika tidak memiliki emulator di laptop/PC.

1.  **Install Aplikasi "Expo Go"** di HP Android Anda dari Google Play Store.
2.  Pastikan HP dan Laptop terhubung ke **jaringan WiFi yang sama**.
3.  Jalankan perintah berikut di terminal:
    ```bash
    npm start
    # atau
    npx expo start
    ```
4.  Terminal akan menampilkan **QR Code**.
5.  Buka aplikasi **Expo Go** di HP, pilih **"Scan QR Code"**, dan scan kode di layar laptop.
6.  Aplikasi akan berjalan di HP Anda.

> **Minimum Android**: Android 6.0 (Marshmallow) atau lebih baru.

### 2. Menjalankan di Web (Browser)

Aplikasi ini mendukung versi web untuk testing cepat tanpa HP.

1.  Jalankan perintah:
    ```bash
    npm run web
    # atau
    npx expo start --web
    ```
2.  Tekan tombol `w` di terminal jika browser tidak terbuka otomatis.
3.  Aplikasi akan terbuka di Chrome/Firefox/Safari.

> **Catatan Web**: Fitur natif seperti Kamera dan Barcode Scanner mungkin memiliki perilaku berbeda atau perlu izin browser khusus. Fitur standar seperti manajemen produk dan transaksi berfungsi normal.

## 🛠️ Fitur Utama

- **Manajemen Produk**: Tambah, edit, hapus, kelola harga grosir.
- **Kasir (POS)**: Scan barcode, keranjang belanja, hitung kembalian, cetak struk (virtual).
- **Pelanggan & Kasbon**: Catat hutang piutang pelanggan.
- **Laporan**: Grafik penjualan harian, stok menipis, dll.
- **Offline Mode**: Tetap bisa melihat data saat internet mati.

## 🏗️ Struktur Project

- `app/`: Halaman (Screens) berbasis Expo Router.
- `src/api/`: Integrasi Backend.
- `src/components/`: Komponen UI reusable.
- `src/stores/`: State management (Zustand).

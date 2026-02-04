# Panduan Transaksi (Transactions)

Modul **Transactions** mencatat semua sejarah penjualan yang terjadi di toko.

## 1. Alur Checkout (Pembayaran)

Setelah semua barang masuk keranjang di POS:

1.  Tekan tombol **Total/Checkout**.
2.  Pilih metode pembayaran (Cash, QRIS, Transfer, atau Kasbon).
3.  **Diskon**: Jika ada diskon, masukkan sebelum pembayaran.
4.  **Uang Diterima**: Masukkan nominal uang yang diberi pelanggan (untuk hitung kembalian).
5.  Tekan **Bayar**.
6.  Cetak struk jika diperlukan.

## 2. Melihat Riwayat Transaksi

1.  Buka menu **Transaction History**.
2.  Anda bisa filter berdasarkan:
    - **Tanggal**: Penjualan hari ini, kemarin, atau bulan lalu.
    - **Status**: Sukses, Pending, atau Dibatalkan.
    - **Pembayaran**: Cari khusus Kasbon atau QRIS.

## 3. Membatalkan Transaksi (Void)

Jika salah input dan pelanggan belum pergi:

1.  Buka detail transaksi.
2.  Tekan **Cancel/Void**.
3.  Stok barang akan otomatis kembali ke gudang.
4.  Uang kas akan otomatis berkurang.

# Panduan Stock Opname (Audit Stok)

**Stock Opname** adalah proses pencocokan antara data di komputer dengan jumlah fisik barang di toko. Lakukan ini secara rutin (misal: tiap akhir bulan) untuk mencegah kebocoran.

## Alur Kerja

1.  **Mulai Sesi (Start Session)**:
    - Buka menu **Stock Opname**.
    - Tekan **Start New Session**.
    - Ini menandai "Waktu Mulai Audit".

2.  **Hitung Barang (Counting)**:
    - Bawa HP/Tablet keliling toko/gudang.
    - Cari produk atau scan barcode-nya.
    - Hitung jumlah fisik di rak.
    - Masukkan angka tersebut di aplikasi (**Physical Qty**).
    - Lakukan untuk semua barang. Aplikasi bisa dijalankan offline jika sinyal di gudang jelek.

3.  **Cek Selisih (Review Variance)**:
    - Sistem akan otomatis menghitung selisih.
    - **Merah**: Barang fisik KURANG dari catatan (Hilang?).
    - **Hijau**: Barang fisik LEBIH dari catatan (Bonus supplier/Salah input kasir?).

4.  **Finalisasi (Finalize)**:
    - Setelah yakin semua terhitung, tekan **Finalize Session**.
    - Sistem akan otomatis mengupdate stok semua barang agar sesuai dengan hitungan fisik Anda.
    - Selisih akan dicatat sebagai laporan kerugian/keuntungan adjustment.

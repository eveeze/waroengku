# Panduan Penggunaan Produk (Products)

Modul **Products** adalah tempat Anda mengelola semua barang yang dijual di warung Anda.

## 1. Menambah Produk Baru

1.  Buka menu **Stock / Products**.
2.  Tekan tombol **+ Add Product**.
3.  Isi informasi penting:
    - **Name**: Nama barang (contoh: "Indomie Goreng").
    - **Barcode**: Scan barcode barang agar nanti kasir bisa scan cepat.
    - **Base Price**: Harga jual standar ke pelanggan.
    - **Cost Price**: Harga modal (kulakan) Anda. PENTING: Isi ini agar sistem bisa hitung keuntungan (profit).
    - **Unit**: Satuan (pcs, kg, pack).
    - **Current Stock**: Stok awal saat ini.
    - **Min Stock Alert**: Batas minimal stok. Jika stok turun di bawah angka ini, sistem akan memberi peringatan "Low Stock".
4.  Tekan **Save**.

## 2. Harga Grosir (Pricing Tiers)

Anda bisa mengatur harga khusus jika pelanggan membeli banyak.

- Di formulir produk, cari bagian **Wholesale Pricing**.
- **Min Qty**: Jumlah minimal beli (misal: 10).
- **Price**: Harga per satuan jika beli minimal segitu (misal: Rp 2.500).
- Contoh Logika: Beli 1 = Rp 3.000, Beli 10 = Rp 2.500/pcs.

## 3. Menghubungkan ke Kategori

Pilih **Category** agar produk rapi di mesin kasir (POS). Jika kategori belum ada, buat dulu di menu Categories.

## FAQ

- **Q: Apa bedanya 'Base Price' dan 'Cost Price'?**
  - A: Base Price = Harga Jual. Cost Price = Harga Modal. Selisihnya adalah keuntungan Anda.
- **Q: Bagaimana cara menghapus produk?**
  - A: Geser (swipe) produk ke kiri di daftar, atau tekan tombol **Delete** di halaman detail. Hati-hati, data penjualan lama produk ini tetap tersimpan di laporan.

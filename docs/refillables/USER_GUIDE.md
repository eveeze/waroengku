# Panduan Penggunaan Refillables (Isi Ulang)

Fitur **Refillables** dirancang untuk melacak stok barang yang memiliki sistem tukar wadah, seperti **Galon Air Mineral** dan **Gas LPG**.

## 1. Konsep Dasar

Berbeda dengan barang biasa, barang isi ulang terdiri dari dua komponen yang perlu dilacak:

1.  **Produk Utama (Isinya)**: Apa yang dibeli pelanggan (contoh: "Gas LPG 3kg"). Ini menghasilkan uang.
2.  **Container (Wadahnya)**: Aset fisik yang berputar (contoh: "Tabung Gas Hijau"). Ini adalah inventaris toko.

## 2. Cara Menggunakan

### Langkah 1: Siapkan Produk (Di Menu Products)

Sebelum masuk ke menu Refillables, pastikan Anda sudah membuat produk yang akan dijual.

- Pergi ke menu **Stock / Products**.
- Buat produk baru, misal:
  - **Nama**: "Gas LPG 3kg (Isi Ulang)"
  - **Harga**: Rp 22.000
  - **Stok**: (Stok di sini hanya untuk penjualan kasir, stok fisik container dilacak di Refillables).

### Langkah 2: Buat Mapping Container (Di Menu Refillables)

Sekarang, kita hubungkan "Wadah Fisik" dengan "Produk Jualan" tadi.

1.  Pergi ke menu **Menu > Refillables**.
2.  Tekan tombol **+ NEW CONTAINER**.
3.  Isi formulir:
    - **Container Name**: Nama wadahnya, misal "Tabung Gas 3kg".
    - **Linked Product**: Cari dan pilih produk "Gas LPG 3kg (Isi Ulang)" yang dibuat di Langkah 1.
    - **Initial Empty**: Jumlah tabung kosong yang Anda miliki saat ini.
    - **Initial Full**: Jumlah tabung penuh (siap jual) yang Anda miliki.
4.  Tekan **Create**.

### Langkah 3: Melacak Pergerakan (Sehari-hari)

Di halaman **Refillables**, Anda akan melihat kartu untuk setiap jenis wadah.

- **Full (Ready)**: Stok barang yang siap dijual.
- **Empty (Void)**: Stok wadah kosong yang menunggu diisi ulang/ditukar ke agen.

#### Skenario Penjualan (Otomatis - Akan Datang)

Saat kasir menjual "Gas LPG 3kg", sistem backend secara otomatis akan:

- Mengurangi 1 **Full** (Tabung isi keluar).
- Menambah 1 **Empty** (Tabung kosong masuk dari pelanggan).

#### Skenario Stok Opname / Kulakan (Manual)

Jika Anda menukar tabung kosong ke agen dan mendapat tabung penuh:

1.  Buka menu **Refillables**.
2.  Pilih "Tabung Gas 3kg" -> Tekan **Adjust Stock**.
3.  Pilih Mode **Reduce Stock** -> Kurangi **Empty** (misal: -10 tabung kosong dikasih ke agen).
4.  Pilih Mode **Add Stock** -> Tambah **Full** (misal: +10 tabung penuh diterima dari agen).

## Ringkasan Alur

1.  **Product** = Untuk Kasir & Harga Harga.
2.  **Refillable Container** = Untuk Gudang & Aset Botol/Tabung.
3.  Keduanya dihubungkan (Linked) agar sistem tahu "Jika Produk A terjual, maka Stok Botol A berkurang".

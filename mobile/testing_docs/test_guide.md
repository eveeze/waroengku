# Warungku Mobile Frontend Testing Guide

Panduan ini dibuat untuk membantu Anda melakukan pengujian (testing) secara menyeluruh terhadap aplikasi mobile frontend Warungku. Tujuannya adalah memastikan setiap fitur berfungsi dengan baik, validasi berjalan semestinya, dan tidak ada error yang mengganggu pengalaman pengguna.

---

## 1. Definition of Done (DoD)

Sebelum menyatakan sebuah fitur "Selesai" atau "Lulus Test", pastikan poin-poin berikut terpenuhi:

- [ ] **Fungsionalitas Utama**: Fitur berjalan sesuai dengan tujuannya (misal: tombol simpan benar-benar menyimpan data).
- [ ] **Validasi Input**:
  - [ ] Form tidak boleh submit jika field wajib kosong.
  - [ ] Format input valid (misal: harga harus angka, email harus format email).
  - [ ] Pesan error muncul dengan jelas jika validasi gagal.
- [ ] **Feedback User (UX)**:
  - [ ] Loading indicator muncul saat proses async (fetch/submit).
  - [ ] Toast/Snackbar muncul saat sukses atau gagal (misal: "Produk berhasil disimpan").
- [ ] **Error Handling**: Aplikasi tidak crash jika terjadi error dari server (misal: 500 Internal Server Error) atau koneksi internet mati.
- [ ] **Tampilan (UI)**: Tampilan rapi, responsif, dan tidak ada elemen yang tumpang tindih (overlap).
- [ ] **Refresh Data**: Data di layar diperbarui otomatis atau manual (pull-to-refresh) setelah melakukan aksi (create/edit/delete).

---

## 2. Rencana Pengujian Per Fitur

Gunakan checklist ini untuk melacak progress pengujian Anda.

### A. Authentication `(auth)`

Lokasi: `app/(auth)`

- [ ] **Login Berhasil**
  - Masukkan email dan password yang benar.
  - Tekan tombol login.
  - Verifikasi redirect ke Dashboard utama.
  - Verifikasi token tersimpan (tidak perlu login lagi saat restart app).
- [ ] **Login Gagal**
  - Masukkan email salah atau password salah.
  - Verifikasi muncul pesan error yang sesuai (misal: "Kredensial tidak valid").
- [ ] **Logout**
  - Cari tombol logout (biasanya di profil atau sidebar).
  - Tekan logout.
  - Verifikasi kembali ke halaman login.

### B. Point of Sale (POS) `(admin)/pos`

Lokasi: `app/(admin)/pos`

- [ ] **List Produk POS**
  - Produk muncul dengan gambar, nama, dan harga yang benar.
  - Scroll list produk lancar (lazy loading jika ada).
  - Pencarian produk berfungsi.
- [ ] **Add to Cart**
  - Klik produk -> masuk ke keranjang.
  - Klik produk berulang kali -> jumlah qty bertambah.
- [ ] **Cart Management**
  - Ubah quantity di keranjang (tambah/kurang).
  - Hapus item dari keranjang.
  - Verifikasi total harga di keranjang benar.
- [ ] **Checkout Process** `checkout.tsx`
  - Klik tombol bayar/checkout.
  - Pilih metode pembayaran (Tunai, QRIS, dll).
  - Masukkan nominal bayar (untuk tunai).
  - Verifikasi kembalian dihitung benar.
  - Submit Transaksi.
  - Verifikasi sukses dan cart kembali kosong.
- [ ] **Held Carts (Keranjang Tertunda)** `held-carts.tsx`
  - Simpan transaksi (Hold) saat di POS.
  - Buka menu Held Carts.
  - Restore salah satu cart ke POS.
  - Verifikasi item kembali ke keranjang utama.

### C. Manajemen Produk `(admin)/products`

Lokasi: `app/(admin)/products`

- [ ] **List Produk** `index.tsx`
  - Data produk tampil lengkap (nama, kategori, stok, harga).
  - Pagination/Infinite scroll berjalan (jika ada).
  - Pull-to-refresh memperbarui data.
- [ ] **Tambah Produk** `create.tsx`
  - Isi form lengkap (Nama, Kategori, Harga Beli, Harga Jual, Stok).
  - Upload gambar produk.
  - Simpan.
  - Verifikasi produk baru muncul di list.
- [ ] **Edit Produk** `[id]`
  - Klik satu produk.
  - Ubah data (misal: harga atau nama).
  - Simpan.
  - Verifikasi perubahan tersimpan.
- [ ] **Hapus Produk**
  - Klik tombol hapus pada produk.
  - Konfirmasi dialog hapus.
  - Verifikasi produk hilang dari list.

### D. Manajemen Kategori `(admin)/categories`

Lokasi: `app/(admin)/categories`

- [ ] **List Kategori**
  - Tampil daftar kategori.
- [ ] **CRUD Kategori**
  - Tambah kategori baru.
  - Edit nama kategori.
  - Hapus kategori (Pastikan validasi: tidak bisa hapus jika ada produk terkait, atau sesuai logic bisnis).

### E. Inventory & Stok `(admin)/inventory` & `(admin)/stock-opname`

Lokasi: `app/(admin)/inventory`

- [ ] **Lihat Stok**
  - Cek status stok saat ini.
- [ ] **Stock Opname**
  - Lakukan penyesuaian stok (stock opname).
  - Verifikasi stok berubah di list produk.

### F. Laporan `(admin)/reports`

Lokasi: `app/(admin)/reports`

- [ ] **Tampilan Laporan**
  - Buka menu laporan.
  - Verifikasi grafik atau ringkasan angka tampil benar.
  - Filter tanggal (hari ini, minggu ini, bulan ini) berfungsi.

### G. Manajemen Pelanggan `(admin)/customers`

Lokasi: `app/(admin)/customers`

- [ ] **List Pelanggan**
  - Tampil daftar pelanggan.
- [ ] **Tambah/Edit Pelanggan**
  - Tambah data pelanggan baru.
  - Edit info pelanggan.

### H. Cash Flow / Keuangan `(admin)/cash-flow`

Lokasi: `app/(admin)/cash-flow`

- [ ] **Catat Pengeluaran/Pemasukan**
  - Input transaksi manual (misal: biaya listrik, dll).
  - Verifikasi masuk ke laporan keuangan.

### I. Users / Pengguna `(admin)/users`

Lokasi: `app/(admin)/users`

- [ ] **Manajemen User Staff**
  - Admin bisa melihat list staff.
  - Admin bisa menambah/mengedit role staff.

---

## 3. Catatan Validasi Khusus

Saat melakukan pengujian, perhatikan hal-hal detail berikut:

1.  **Format Uang**: Pastikan semua tampilan harga menggunakan format Rupiah (Rp) yang konsisten (misal: Rp 10.000, bukan 10000).
2.  **Gambar**: Pastikan gambar produk tidak broken link. Jika gambar kosong, pastikan ada placeholder default.
3.  **Navigasi**: Pastikan tombol "Back" berfungsi di setiap halaman detail, dan tidak membuat user terjebak.
4.  **Keyboard**: Pada form input angka (harga/stok), pastikan keypad yang muncul adalah numeric.

## 4. Cara Melaporkan Bug

Jika menemukan validasi yang gagal atau fitur yang error, catat dengan format:

- **Fitur**: (Misal: Edit Produk)
- **Langkah**: Jelaskan langkah yang Anda lakukan.
- **Ekspektasi**: Apa yang seharusnya terjadi.
- **Realita**: Apa yang sebenarnya terjadi (Error message, crash, atau tidak merespon).

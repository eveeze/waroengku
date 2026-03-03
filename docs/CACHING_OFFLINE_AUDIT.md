# 📋 Audit Caching, Offline Support & Missing Features

> **Date**: 2026-02-25
> **App**: Warungku Mobile (React Native / Expo)

---

## Bagian 1: Status Caching Saat Ini

### ✅ Yang Sudah Benar

| Komponen                            | Detail                                                                                 | Verdict |
| :---------------------------------- | :------------------------------------------------------------------------------------- | :-----: |
| **React Query defaults**            | `staleTime: 1min`, `gcTime: 5min`, `retry: 2`, `refetchOnReconnect: true`              | ✅ Baik |
| **ETag support**                    | `fetcher()` dan `fetchWithCache()` mengirim `If-None-Match`, handle `304 Not Modified` | ✅ Baik |
| **AsyncStorage cache** (`apiCache`) | Persistent cache dengan TTL 24 jam, dipakai sebagai fallback untuk 304                 | ✅ Baik |
| **Token refresh**                   | Auto-refresh saat 401, queue concurrent requests                                       | ✅ Baik |
| **Rate limit**                      | Auto-retry setelah 429                                                                 | ✅ Baik |

### ⚠️ Yang Perlu Diperbaiki

|  #  | Issue                                      | Detail                                                                                                                                                                                                                                  | Severity  |
| :-: | :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: |
|  1  | **Cart store TIDAK persisted**             | `cartStore.ts` menggunakan Zustand polos tanpa `persist` middleware. Jika app crash/reload, keranjang hilang. Bandingkan dengan `themeStore.ts` dan `authStore.ts` yang sudah menggunakan `persist` + `AsyncStorage`.                   |  🔴 High  |
|  2  | **`staleTime: 0` override**                | `consignment/index.tsx` & `customers/index.tsx` mengeset `staleTime: 0, gcTime: 0` — ini meng-bypass cache sepenuhnya dan membuat request baru setiap navigasi. Ini karena workaround bug sebelumnya, idealnya dikembalikan ke default. | 🟡 Medium |
|  3  | **Network store tidak digunakan**          | `networkStore.ts` + `NetInfo` listener aktif di `_layout.tsx`, tapi **tidak ada komponen yang menggunakannya** untuk menampilkan "offline mode" banner atau untuk offline fallback.                                                     | 🟡 Medium |
|  4  | **Tidak ada offline queue**                | Saat device offline, mutation (POST/PUT/DELETE) langsung gagal. Tidak ada mekanisme queue untuk retry saat online kembali.                                                                                                              | 🟡 Medium |
|  5  | **`NetInfo` import di `client.ts` unused** | `NetInfo` di-import di `client.ts` baris 6 tapi tidak digunakan — seharusnya dipakai untuk offline fallback di interceptor.                                                                                                             |  🔵 Low   |

---

## Bagian 2: Status Fitur yang Belum Ada

### ❌ Receipt Printing — Belum Diimplementasi

**Backend**: Tidak memerlukan endpoint khusus — data struk sudah ada di response `POST /transactions` (invoice_number, items, totals, change_amount).

**Frontend**: Belum ada integrasi printer. Perlu library seperti `react-native-thermal-receipt-printer` untuk printer Bluetooth/USB thermal.

---

### ❌ PIN Login / Fast POS Switching — Belum Diimplementasi

**Backend**: Docs menyebutkan ini sebagai "Future". Belum ada endpoint PIN di backend.

**Kebutuhan**: Cashier bisa switch user cepat via PIN 4-6 digit tanpa full email+password login. Butuh backend endpoint baru + frontend PIN pad UI.

---

### ❌ Offline Support — Parsial

**Yang sudah ada**: `apiCache` (GET requests tersimpan 24 jam), `networkStore` (deteksi status jaringan).

**Yang BELUM ada**: Offline queue untuk mutations, offline-first POS checkout, sync mechanism saat reconnect.

---

## Bagian 3: Prompt untuk Pengerjaan

Berikut adalah **3 prompt terpisah** yang bisa kamu berikan ke AI assistant (atau tim frontend) untuk mengimplementasikan masing-masing fitur:

---

### 🖨️ Prompt 1: Receipt Printing

```
Implementasikan fitur cetak struk (receipt printing) di aplikasi React Native (Expo) Warungku.

KONTEKS:
- App menggunakan React Native dengan Expo (development client, bukan Expo Go)
- Printer target: Printer Thermal Bluetooth 58mm/80mm (model umum seperti EPPOS, Xprinter)
- Data struk sudah ada di response POST /transactions yang mengembalikan:
  - invoice_number, customer name, items (product_name, quantity, unit_price, total_amount),
    subtotal, discount_amount, tax_amount, total_amount, payment_method, amount_paid, change_amount, created_at
- POS checkout flow ada di: app/(admin)/pos/checkout.tsx
- Transaction detail ada di: app/(admin)/transactions/[id].tsx

YANG HARUS DIIMPLEMENTASIKAN:

1. Install library printer yang kompatibel dengan Expo Dev Client (bukan Expo Go):
   - Gunakan `react-native-thermal-receipt-printer-image-qr` atau `react-native-esc-pos-printer`
   - Sesuaikan dengan EAS build (perlu native module)

2. Buat komponen/utility:
   - `src/utils/receipt.ts` — Format data transaksi menjadi template struk
   - `src/hooks/usePrinter.ts` — Hook untuk scan, connect, dan print ke printer Bluetooth
   - `src/components/shared/PrintReceiptButton.tsx` — Tombol cetak yang reusable

3. Template struk harus mengandung:
   - Header: Nama toko "WARUNG MANTO", alamat, telp
   - Invoice number + tanggal
   - Daftar item dengan qty × harga = subtotal
   - Diskon (jika ada)
   - Total, metode bayar, nominal bayar, kembalian
   - Footer: "Terima Kasih!"

4. Integrasi di 2 tempat:
   - Setelah checkout berhasil (checkout.tsx) — auto-print atau tombol "Print"
   - Di transaction detail ([id].tsx) — tombol "Reprint Receipt"

5. Printer settings page:
   - Scan printer Bluetooth
   - Simpan printer terakhir ke AsyncStorage
   - Auto-reconnect saat buka app
   - Test print

CATATAN:
- Karena pakai Expo Dev Client + EAS Build, native module diperbolehkan
- Pastikan handle error: printer not found, paper out, disconnected
- Cart store ada di: src/stores/cartStore.ts (Zustand)
- API client ada di: src/api/client.ts
```

---

### 🔢 Prompt 2: PIN Login / Fast POS Switching

```
Implementasikan fitur PIN Login untuk fast switching antar kasir di aplikasi Warungku.

KONTEKS:
- Backend saat ini hanya punya email+password login (POST /auth/login)
- App adalah React Native (Expo) dengan auth store di src/stores/authStore.ts
- Login screen di app/(auth)/login.tsx
- User types: admin, cashier, inventory (tabel users di backend)

BACKEND YANG PERLU DITAMBAHKAN DULU:

1. Tambahkan kolom `pin` (hashed) di tabel users
2. Endpoint baru:
   - `POST /auth/pin/setup` — Set/change PIN (requires current password)
     Body: { pin: "1234", current_password: "xxx" }
   - `POST /auth/pin/login` — Login via PIN
     Body: { user_id: "uuid", pin: "1234" }
     Response: Same as /auth/login (access_token, refresh_token, user)
   - `GET /auth/pin/users` — Get list of users yang sudah setup PIN (untuk selector)
     Response: [{ id, name, role, avatar_url }] (TANPA data sensitif)

FRONTEND YANG HARUS DIIMPLEMENTASIKAN:

1. PIN Setup (di profile/settings):
   - UI: Input current password + input PIN baru (4-6 digit) + confirm PIN
   - Endpoint: POST /auth/pin/setup
   - Simpan flag "has_pin" di user data

2. PIN Login Screen:
   - Tampilkan grid avatar users yang sudah setup PIN (dari GET /auth/pin/users)
   - User tap avatar → muncul PIN pad (numpad 0-9 + backspace)
   - PIN input: 4-6 digit, auto-submit saat lengkap
   - Animasi shake jika salah
   - Fallback: tombol "Login dengan Email" → ke login.tsx biasa

3. Fast Switching:
   - Di header dashboard, tombol "Switch User"
   - Buka PIN login modal (bukan full screen, sebagai modal)
   - Setelah PIN berhasil: swap tokens, update auth store, refresh dashboard
   - Lock screen setelah X menit idle (configurable)

4. Files baru:
   - `app/(auth)/pin-login.tsx` — Full PIN login screen
   - `src/components/shared/PinPad.tsx` — Reusable numpad component
   - `src/components/shared/UserSelector.tsx` — Grid avatar selector
   - `src/api/endpoints/auth.ts` — Tambahkan pinSetup(), pinLogin(), getPinUsers()

CATATAN:
- PIN harus di-hash di backend (bcrypt), JANGAN simpan plaintext
- Rate limit PIN login: max 5 attempts per 5 menit
- Auto-lock setelah 3 kali salah → require full email+password login
- Design: Numpad style iOS/Android native lock screen (haptic feedback)
```

---

### 📶 Prompt 3: Offline Support & Caching Improvements

````
Perbaiki dan tingkatkan offline support dan caching di aplikasi Warungku (React Native / Expo).

KONTEKS SAAT INI (sudah ada):
- React Query v5: staleTime 1min, gcTime 5min, retry 2, refetchOnReconnect true
- apiCache (AsyncStorage): TTL 24 jam, ETag support, 304 handling
- networkStore (Zustand + NetInfo): Listener aktif tapi TIDAK DIGUNAKAN di UI
- Cart store (Zustand): TIDAK persisted — crash = data hilang
- NetInfo import di client.ts: UNUSED

YANG HARUS DIIMPLEMENTASIKAN:

### A. Fix Cart Persistence (PRIORITAS TINGGI)
1. Tambahkan Zustand `persist` middleware ke `cartStore.ts`:
   ```typescript
   import { persist, createJSONStorage } from 'zustand/middleware';
   import AsyncStorage from '@react-native-async-storage/async-storage';

   export const useCartStore = create<CartState>()(
     persist(
       (set, get) => ({
         // ... existing state & actions
       }),
       {
         name: 'cart-storage',
         storage: createJSONStorage(() => AsyncStorage),
         partialize: (state) => ({
           items: state.items,
           customer: state.customer
         }),
       }
     )
   );
````

- Ini sudah dilakukan di themeStore.ts dan authStore.ts sebagai contoh

### B. Offline Banner UI

1. Buat komponen `src/components/shared/OfflineBanner.tsx`:
   - Gunakan `useNetworkStore` untuk cek isConnected
   - Tampilkan banner kuning "Anda sedang offline" di atas layar
   - Auto-dismiss saat online kembali
2. Pasang di `app/(admin)/_layout.tsx`

### C. Offline Read (GET requests)

1. Di `client.ts`, gunakan NetInfo di interceptor:
   - Jika offline + GET request → langsung return dari apiCache
   - Jika offline + POST/PUT/DELETE → queue ke offline store
2. React Query: Saat offline, jangan retry (gunakan `networkMode: 'offlineFirst'`)

### D. Offline Mutation Queue (OPSIONAL - untuk Stock Opname)

1. Buat `src/stores/offlineQueueStore.ts`:
   - Queue mutations saat offline
   - Sync saat online (NetInfo reconnect event)
   - Tampilkan badge "X pending syncs" di UI
2. Prioritas utama: Stock Opname (recording counts di gudang tanpa WiFi)

### E. Cache Override Cleanup

1. `consignment/index.tsx`: Hapus `staleTime: 0, gcTime: 0`
   - Bug consignor deletion sudah di-fix, tidak perlu bypass cache
2. `customers/index.tsx`: Same — kembalikan ke default atau staleTime: 30s

FILES YANG PERLU DIMODIFIKASI:

- src/stores/cartStore.ts (tambah persist)
- src/api/client.ts (offline interceptor)
- src/lib/react-query.ts (networkMode)
- app/(admin)/\_layout.tsx (offline banner)
- app/(admin)/consignment/index.tsx (hapus cache override)
- app/(admin)/customers/index.tsx (hapus cache override)

FILES BARU:

- src/components/shared/OfflineBanner.tsx
- src/stores/offlineQueueStore.ts (opsional)

CATATAN PENTING:

- Jangan gunakan @react-native-community/netinfo langsung di komponen —
  gunakan useNetworkStore yang sudah ada
- authStore.ts dan themeStore.ts sudah contoh persist + AsyncStorage
- Test: matikan WiFi → buka app → cek apakah data terakhir muncul dari cache

```

---

## Prioritas Implementasi yang Disarankan

| # | Fitur | Effort | Impact | Prioritas |
|:-:|:------|:------:|:------:|:---------:|
| 1 | **Cart persistence** (Fix) | 🟢 Kecil (30 menit) | 🔴 Tinggi | **P0** |
| 2 | **Offline banner** | 🟢 Kecil (1 jam) | 🟡 Medium | **P1** |
| 3 | **Cache override cleanup** | 🟢 Kecil (15 menit) | 🟡 Medium | **P1** |
| 4 | **Receipt printing** | 🟡 Medium (1-2 hari) | 🔴 Tinggi | **P1** |
| 5 | **Offline read fallback** | 🟡 Medium (3-4 jam) | 🟡 Medium | **P2** |
| 6 | **PIN login** | 🔴 Besar (3-4 hari) | 🟡 Medium | **P2** |
| 7 | **Offline mutation queue** | 🔴 Besar (2-3 hari) | 🟡 Medium | **P3** |
```

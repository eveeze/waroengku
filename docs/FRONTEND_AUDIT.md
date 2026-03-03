# 🔍 Frontend Mobile Audit Report

> **Date**: 2026-02-25
> **Scope**: Cross-reference semua endpoint backend (dari `docs/`) dengan implementasi frontend mobile (`mobile/`)

---

## Ringkasan

| Module        | Backend Endpoints |       Frontend API       |        Frontend Pages        | Status     |
| :------------ | :---------------: | :----------------------: | :--------------------------: | :--------- |
| Auth          |         3         |      3 (+2 helpers)      |          1 (login)           | ✅ Lengkap |
| Products      |   7 + 3 pricing   | 7 + 3 pricing + 1 toggle |           7 pages            | ✅ Lengkap |
| Categories    |         5         |            5             |           4 pages            | ✅ Lengkap |
| Customers     |         6         |            6             |           9 pages            | ✅ Lengkap |
| Kasbon        |         4         |            4             | 2 pages (embed di customers) | ✅ Lengkap |
| Transactions  |         5         |            5             |           3 pages            | ✅ Lengkap |
| POS           |         5         |            5             |           5 pages            | ✅ Lengkap |
| Payments      |         4         |            4             |      — (inline di POS)       | ✅ Lengkap |
| Cash Flow     |         6         |            6             |           6 pages            | ✅ Lengkap |
| Reports       |         4         |            4             |           5 pages            | ✅ Lengkap |
| Inventory     |         6         |            6             |           4 pages            | ✅ Lengkap |
| Stock Opname  |         9         |            9             |           4 pages            | ✅ Lengkap |
| Consignment   | 4 (+1 get by id)  |            5             |           4 pages            | ✅ Lengkap |
| Refillables   |         3         |     3 (+1 movements)     |           5 pages            | ✅ Lengkap |
| Users         |         5         |            5             |           4 pages            | ✅ Lengkap |
| Notifications |         3         |            3             |            1 page            | ✅ Lengkap |

**Total: ~74 backend endpoints → ~75 frontend API functions → 64 route files**

---

## Detail Per Module

### 1. 🔐 Auth (`/auth`)

| Backend Endpoint      | Frontend API                       | Status |
| :-------------------- | :--------------------------------- | :----: |
| `POST /auth/login`    | `login()`                          |   ✅   |
| `POST /auth/register` | `registerUser()`                   |   ✅   |
| `POST /auth/refresh`  | `refreshToken()`                   |   ✅   |
| —                     | `logout()` (local helper)          |   ✅   |
| —                     | `isAuthenticated()` (local helper) |   ✅   |

**Pages**: `(auth)/login.tsx`

> [!NOTE]
> Tidak ada halaman register terpisah. Registrasi user baru dilakukan melalui menu **Users > Create** oleh admin.

---

### 2. 📦 Products (`/products`)

| Backend Endpoint                            | Frontend API                            | Status |
| :------------------------------------------ | :-------------------------------------- | :----: |
| `GET /products`                             | `getProducts()`                         |   ✅   |
| `POST /products`                            | `createProduct()` (multipart/form-data) |   ✅   |
| `GET /products/search?barcode=`             | `searchProductByBarcode()`              |   ✅   |
| `GET /products/{id}`                        | `getProductById()`                      |   ✅   |
| `PUT /products/{id}`                        | `updateProduct()` (multipart/form-data) |   ✅   |
| `DELETE /products/{id}`                     | `deleteProduct()`                       |   ✅   |
| `POST /products/{id}/pricing-tiers`         | `addPricingTier()`                      |   ✅   |
| `PUT /products/{id}/pricing-tiers/{tid}`    | `updatePricingTier()`                   |   ✅   |
| `DELETE /products/{id}/pricing-tiers/{tid}` | `deletePricingTier()`                   |   ✅   |
| `PATCH /products/{id}/toggle-active`        | `toggleProductActive()`                 |   ✅   |

**Pages**: `products/index.tsx`, `products/create.tsx`, `products/[id]/index.tsx`, `products/[id]/edit.tsx`, `products/[id]/pricing.tsx` + layouts

---

### 3. 🏷️ Categories (`/categories`)

| Backend Endpoint          | Frontend API        | Status |
| :------------------------ | :------------------ | :----: |
| `GET /categories`         | `getCategories()`   |   ✅   |
| `GET /categories/{id}`    | `getCategoryById()` |   ✅   |
| `POST /categories`        | `createCategory()`  |   ✅   |
| `PUT /categories/{id}`    | `updateCategory()`  |   ✅   |
| `DELETE /categories/{id}` | `deleteCategory()`  |   ✅   |

**Pages**: `categories/index.tsx`, `categories/create.tsx`, `categories/[id].tsx` + layout

---

### 4. 👥 Customers (`/customers`)

| Backend Endpoint           | Frontend API             | Status |
| :------------------------- | :----------------------- | :----: |
| `GET /customers`           | `getCustomers()`         |   ✅   |
| `POST /customers`          | `createCustomer()`       |   ✅   |
| `GET /customers/with-debt` | `getCustomersWithDebt()` |   ✅   |
| `GET /customers/{id}`      | `getCustomerById()`      |   ✅   |
| `PUT /customers/{id}`      | `updateCustomer()`       |   ✅   |
| `DELETE /customers/{id}`   | `deleteCustomer()`       |   ✅   |

**Pages**: `customers/index.tsx`, `customers/create.tsx`, `customers/[id]/index.tsx`, `customers/[id]/edit.tsx`, `customers/[id]/kasbon.tsx`, `customers/[id]/payment.tsx`, `customers/[id]/transactions.tsx` + layouts

---

### 5. 💳 Kasbon (`/kasbon`)

| Backend Endpoint                         | Frontend API            | Status |
| :--------------------------------------- | :---------------------- | :----: |
| `GET /kasbon/customers/{id}`             | `getKasbonHistory()`    |   ✅   |
| `GET /kasbon/customers/{id}/summary`     | `getKasbonSummary()`    |   ✅   |
| `GET /kasbon/customers/{id}/billing/pdf` | `downloadBillingPdf()`  |   ✅   |
| `POST /kasbon/customers/{id}/payments`   | `recordKasbonPayment()` |   ✅   |

**Pages**: Terintegrasi di `customers/[id]/kasbon.tsx` dan `customers/[id]/payment.tsx`

---

### 6. 🧾 Transactions (`/transactions`)

| Backend Endpoint                 | Frontend API          | Status |
| :------------------------------- | :-------------------- | :----: |
| `GET /transactions`              | `getTransactions()`   |   ✅   |
| `GET /transactions/{id}`         | `getTransaction()`    |   ✅   |
| `POST /transactions`             | `createTransaction()` |   ✅   |
| `POST /transactions/calculate`   | `calculateCart()`     |   ✅   |
| `POST /transactions/{id}/cancel` | `cancelTransaction()` |   ✅   |

**Pages**: `transactions/index.tsx`, `transactions/[id].tsx` + layout

---

### 7. 🛒 POS (`/pos`)

| Backend Endpoint                    | Frontend API     | Status |
| :---------------------------------- | :--------------- | :----: |
| `POST /pos/held-carts`              | `holdCart()`     |   ✅   |
| `GET /pos/held-carts`               | `getHeldCarts()` |   ✅   |
| `POST /pos/held-carts/{id}/resume`  | `resumeCart()`   |   ✅   |
| `POST /pos/held-carts/{id}/discard` | `discardCart()`  |   ✅   |
| `POST /pos/refunds`                 | `createRefund()` |   ✅   |

**Pages**: `pos/index.tsx` (POS utama), `pos/checkout.tsx`, `pos/held-carts.tsx`, `pos/refunds.tsx` + layout

---

### 8. 💰 Payments (`/payments`)

| Backend Endpoint                    | Frontend API                | Status | Notes                                     |
| :---------------------------------- | :-------------------------- | :----: | :---------------------------------------- |
| `POST /payments/qris/charge`        | `chargeQris()`              |   ✅   | QRIS Core API (generate QR code)          |
| `POST /payments/notification`       | —                           |   ➖   | Webhook server-side, frontend tidak perlu |
| `POST /payments/{id}/manual-verify` | `manualVerifyPayment()`     |   ✅   |                                           |
| `GET /payments/transaction/{id}`    | `getPaymentByTransaction()` |   ✅   |                                           |
| `GET /payments/{payment_id}/status` | `getQrisPaymentStatus()`    |   ✅   | Untuk polling status pembayaran QRIS      |

> [!NOTE]
> Backend menggunakan **Midtrans QRIS Core API** (bukan Snap popup). `POST /payments/notification` adalah webhook endpoint server-side = tidak relevan untuk frontend.

---

### 9. 💵 Cash Flow (`/cashflow`)

| Backend Endpoint               | Frontend API              | Status |
| :----------------------------- | :------------------------ | :----: |
| `POST /cashflow/drawer/open`   | `openDrawer()`            |   ✅   |
| `POST /cashflow/drawer/close`  | `closeDrawer()`           |   ✅   |
| `GET /cashflow/drawer/current` | `getCurrentSession()`     |   ✅   |
| `GET /cashflow/categories`     | `getCashFlowCategories()` |   ✅   |
| `POST /cashflow`               | `recordCashFlow()`        |   ✅   |
| `GET /cashflow`                | `getCashFlows()`          |   ✅   |

**Pages**: `cash-flow/index.tsx`, `cash-flow/open.tsx`, `cash-flow/close.tsx`, `cash-flow/record.tsx`, `cash-flow/history.tsx` + layout

---

### 10. 📊 Reports (`/reports`)

| Backend Endpoint                     | Frontend API           | Status |
| :----------------------------------- | :--------------------- | :----: |
| `GET /reports/dashboard`             | `getDashboard()`       |   ✅   |
| `GET /reports/daily?date=YYYY-MM-DD` | `getDailyReport()`     |   ✅   |
| `GET /reports/kasbon`                | `getKasbonReport()`    |   ✅   |
| `GET /reports/inventory`             | `getInventoryReport()` |   ✅   |

**Pages**: `reports/index.tsx` (hub), `reports/daily.tsx`, `reports/kasbon.tsx`, `reports/inventory.tsx` + layout

---

### 11. 📋 Inventory (`/inventory`)

| Backend Endpoint                  | Frontend API             | Status |
| :-------------------------------- | :----------------------- | :----: |
| `POST /inventory/restock`         | `restockProduct()`       |   ✅   |
| `POST /inventory/adjust`          | `adjustStock()`          |   ✅   |
| `GET /inventory/low-stock`        | `getLowStockProducts()`  |   ✅   |
| `GET /inventory/report`           | `getInventoryOverview()` |   ✅   |
| `GET /inventory/restock-list/pdf` | `getRestockListPdf()`    |   ✅   |
| `GET /inventory/{id}/movements`   | `getProductMovements()`  |   ✅   |

**Pages**: `inventory/index.tsx`, `inventory/restock.tsx`, `inventory/adjust.tsx` + layout

---

### 12. 📝 Stock Opname (`/stock-opname`)

| Backend Endpoint                            | Frontend API              | Status |
| :------------------------------------------ | :------------------------ | :----: |
| `GET /stock-opname/sessions`                | `getOpnameSessions()`     |   ✅   |
| `POST /stock-opname/sessions`               | `startOpnameSession()`    |   ✅   |
| `GET /stock-opname/sessions/{id}`           | `getOpnameSession()`      |   ✅   |
| `POST /stock-opname/sessions/{id}/items`    | `recordOpnameCount()`     |   ✅   |
| `GET /stock-opname/sessions/{id}/variance`  | `getVarianceReport()`     |   ✅   |
| `POST /stock-opname/sessions/{id}/finalize` | `finalizeOpnameSession()` |   ✅   |
| `POST /stock-opname/sessions/{id}/cancel`   | `cancelOpnameSession()`   |   ✅   |
| `GET /stock-opname/shopping-list`           | `getShoppingList()`       |   ✅   |
| `GET /stock-opname/near-expiry`             | `getNearExpiryReport()`   |   ✅   |

**Pages**: `stock-opname/index.tsx`, `stock-opname/[id].tsx`, `stock-opname/variance.tsx` + layout

---

### 13. 🤝 Consignment (`/consignors`)

| Backend Endpoint          | Frontend API         | Status |
| :------------------------ | :------------------- | :----: |
| `GET /consignors`         | `getConsignors()`    |   ✅   |
| `GET /consignors/{id}`    | `getConsignorById()` |   ✅   |
| `POST /consignors`        | `createConsignor()`  |   ✅   |
| `PUT /consignors/{id}`    | `updateConsignor()`  |   ✅   |
| `DELETE /consignors/{id}` | `deleteConsignor()`  |   ✅   |

**Pages**: `consignment/index.tsx`, `consignment/create.tsx`, `consignment/[id].tsx` + layout

> [!NOTE]
> `getConsignors()` memiliki banyak debug logging yang tersisa dan workaround client-side filter `is_active`. Sebaiknya dibersihkan untuk production.

---

### 14. 🔄 Refillables (`/refillables`)

| Backend Endpoint                  | Frontend API                  |   Status   |
| :-------------------------------- | :---------------------------- | :--------: |
| `GET /refillables`                | `getRefillableContainers()`   |     ✅     |
| `POST /refillables`               | `createRefillableContainer()` |     ✅     |
| `POST /refillables/adjust`        | `adjustRefillableStock()`     |     ✅     |
| `GET /refillables/{id}/movements` | `getRefillableMovements()`    | ✅ (Extra) |

**Pages**: `refillables/index.tsx`, `refillables/create.tsx`, `refillables/adjust.tsx`, `refillables/[id]/movements.tsx` + layout

---

### 15. 👤 Users (`/users`)

| Backend Endpoint     | Frontend API    | Status |
| :------------------- | :-------------- | :----: |
| `GET /users`         | `getUsers()`    |   ✅   |
| `POST /users`        | `createUser()`  |   ✅   |
| `GET /users/{id}`    | `getUserById()` |   ✅   |
| `PUT /users/{id}`    | `updateUser()`  |   ✅   |
| `DELETE /users/{id}` | `deleteUser()`  |   ✅   |

**Pages**: `users/index.tsx`, `users/create.tsx`, `users/[id].tsx` + layout

---

### 16. 🔔 Notifications (`/notifications`)

| Backend Endpoint                 | Frontend API                   | Status |
| :------------------------------- | :----------------------------- | :----: |
| `GET /notifications`             | `getNotifications()`           |   ✅   |
| `PATCH /notifications/{id}/read` | `markNotificationAsRead()`     |   ✅   |
| `PATCH /notifications/read-all`  | `markAllNotificationsAsRead()` |   ✅   |

**Pages**: `notifications/index.tsx`

---

## Halaman Tambahan (Non-API Specific)

| Page                  | Fungsi                                                              |
| :-------------------- | :------------------------------------------------------------------ |
| `(admin)/index.tsx`   | Dashboard utama (mengambil `/reports/dashboard` + `/notifications`) |
| `(admin)/menu.tsx`    | Menu navigasi admin                                                 |
| `(admin)/_layout.tsx` | Layout wrapper admin                                                |
| `app/index.tsx`       | Entry point / splash redirect                                       |
| `app/_layout.tsx`     | Root layout                                                         |

---

## 🧹 Catatan & Rekomendasi

### Issues Ditemukan

|  #  | Severity  | File                                      | Issue                                                                                                          |
| :-: | :-------: | :---------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
|  1  | 🟡 Medium | `consignment.ts`                          | Banyak `console.log` debug tersisa di `getConsignors()` — harus dibersihkan sebelum production                 |
|  2  | 🟢 Fixed  | `daily.tsx`, `TransactionFilterModal.tsx` | Bug UTC date sudah **diperbaiki** di sesi ini (menggunakan `formatLocalDate()`)                                |
|  3  | 🟡 Medium | `users.ts`                                | `updateUser()` menggunakan type `any` — sebaiknya buat `UpdateUserRequest` interface                           |
|  4  |  🔵 Low   | Payments docs                             | Docs `payments/README.md` masih menyebutkan Snap — perlu di-update ke QRIS Core API sesuai implementasi aktual |

### Fitur Backend yang Belum Ada Halaman Dedicated

| Fitur                                   | Status                                                                        |
| :-------------------------------------- | :---------------------------------------------------------------------------- |
| Midtrans Snap (deprecated)              | ✅ Sudah diganti QRIS Core API di backend & frontend                          |
| `POST /payments/notification` (Webhook) | ➖ Server-side only, tidak perlu frontend                                     |
| Receipt Printing                        | ❌ Belum ada integrasi printer (disebutkan di docs tapi belum diimplementasi) |
| PIN Login (Fast POS switching)          | ❌ Disebut sebagai "Future" di docs                                           |
| Offline Support (Stock Opname)          | ❌ Disebutkan di docs tapi belum diimplementasi                               |

### Kesimpulan

**Semua ~74 backend endpoints sudah ter-cover oleh frontend API layer.** Semua modul memiliki halaman/UI yang sesuai. Tidak ada endpoint signifikan yang terlewat. Beberapa item minor yang perlu perhatian:

1. **Bersihkan debug logs** di `consignment.ts`
2. **Typing** untuk `updateUser()` — gunakan interface proper
3. **Update docs** payments untuk merefleksikan perubahan dari Snap ke QRIS Core API
4. **Receipt printing** dan **offline support** masih belum diimplementasi (future features)

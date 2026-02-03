# Consignment Module

Base URL: `/api/v1`

## Business Context

Manages "Titip Jual" (goods owned by others).

- **Consignor**: The person who owns the goods.
- **Settlement**: Paying the consignor for sold items (Revenue - Commission).

## Frontend Implementation Guide: Consignment Integration

This guide details the changes required in the Frontend application to support the new **Consignor-Product Linking** features.

### 1. Consignor Dashboard & Settlements

> [!TIP]
> **Optimistic UI Support**:
> Use `ETag` to cache consignor lists and settlement history.
> See [Optimistic UI Guide](../OPTIMISTIC_UI.md).

### 2. Product Management (Association)

We need to allow users to assign a "Supplier" or "Consignor" when creating or editing a product.

#### UI Changes

- Add a **Dropdown/Select** input field labeled **"Consignor / Supplier"**.
- Place it ideally near "Category" or "Cost Price".
- The value should be the `id` of the consignor.

#### Data Fetching

- **Fetch Consignors**: Call `GET /api/v1/consignors` to populate the dropdown options.
- **Cache**: This list changes infrequently. Use `staleTime: 5 minutes` or similar.

#### Form Submission

- Include `consignor_id` in the payload if selected.
- If the user clears the selection, send `null` or omit the field (if backend allows).

**Payload Example:**

```json
{
  "name": "Kripik Singkong",
  "base_price": 5000,
  "category_id": "...",
  "consignor_id": "8939670d-f538-4034-8c76-589578278219" // <--- NEW FIELD
}
```

### 3. Inventory / Product List

We need to allow users to filter products to see only those belonging to a specific Consignor.

#### UI Changes

- Add a **Filter Button** or **Dropdown** in the Product List header.
- Label: "Filter by Consignor".
- Options: List of all Consignors (fetch from `GET /api/v1/consignors`).

#### API Integration

- Pass the selected ID as a query parameter to the list endpoint.
- Endpoint: `GET /api/v1/products`
- Parameter: `consignor_id={UUID}`

**Example URL:**
`/api/v1/products?page=1&per_page=20&consignor_id=8939670d-f538-4034-8c76-589578278219`

### 4. Consignor Detail Page

On the Consignor management page, it would be helpful to show a list of products they own.

- **Implementation**: Reuse the **Product List Component**.
- **Props**: Pass `filter={{ consignor_id: currentConsignor.id }}` to the list component.

---

## API Summary

| Feature            | Endpoint         | Method | New Parameter / Field          |
| :----------------- | :--------------- | :----- | :----------------------------- |
| **List Products**  | `/products`      | `GET`  | `?consignor_id=UUID`           |
| **Create Product** | `/products`      | `POST` | Body: `"consignor_id": "UUID"` |
| **Update Product** | `/products/{id}` | `PUT`  | Body: `"consignor_id": "UUID"` |

## Endpoints

### 1. Create Consignor

Register a new consignor (supplier).

- **URL**: `/consignors`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)

#### Request Body

```json
{
  "name": "Supplier B",
  "phone": "08xxxx",
  "bank_account": "123456",
  "bank_name": "BCA"
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Consignor created",
  "data": { "id": "uuid", "name": "Supplier B", ... }
}
```

### 2. List Consignors

List all consignors.

- **URL**: `/consignors`
- **Method**: `GET`
- **Auth Required**: Yes (Admin only)

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Consignors retrieved",
  "data": [ ... ]
}
```

### 3. Update Consignor

Update consignor details.

- **URL**: `/consignors/{id}`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin only)

#### Request Body

```json
{
  "name": "Updated Name",
  "is_active": true
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Consignor updated",
  "data": { ... }
}
```

### 4. Delete Consignor

Soft delete a consignor.

- **URL**: `/consignors/{id}`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin only)

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Consignor deleted successfully",
  "data": null
}
```

# Changelog - MiTienda POS

## 2025-10-18 - Customer API Integration with Decolecta

### ✅ Complete Real API Integration

#### Decolecta API Integration (RENIEC/SUNAT)
- **Backend endpoints created**:
  - `GET /api/v1/customers/lookup/{document}?type={dni|ruc}` - Query official government databases
  - `GET /api/v1/customers/search-by-document` - Search local customer database
- **Two-step intelligent search**:
  1. Check local database first (fast, no API cost)
  2. If not found, query Decolecta (RENIEC for DNI, SUNAT for RUC)
  3. Auto-fill form with official government data
- **Auto-complete customer data**:
  - DNI → nombres, apellidos from RENIEC
  - RUC → razón social from SUNAT

#### Frontend Customer Service
- **New `customersApi.js` service**: Complete CRUD for customers
  - `searchByDocument()` - Find customer by DNI/RUC
  - `lookupDocument()` - Query Decolecta API
  - `createCustomer()`, `updateCustomer()`, `deleteCustomer()`
  - Automatic field mapping between frontend and backend formats

#### Updated Components
- **CustomerSearchModal**: Complete rewrite using real API
  - Search customers by document number
  - Auto-complete from RENIEC/SUNAT if not in database
  - Improved UX with loading states and clear messages
  - Create customer with pre-filled government data

- **StartSaleModal**: Now uses real customersApi
  - Integrated Decolecta lookup
  - Auto-fills official data for new customers

### 🔧 Technical Implementation

**Backend (CodeIgniter 4)**:
- File: `app/Controllers/V1/Customer.php`
  - `lookup()` - Decolecta API integration
  - `searchByDocument()` - Local database search
- File: `app/Config/Routes.php` - New routes added
- **Required**: `DECOLECTA_TOKEN` environment variable

**Frontend (Vue 3)**:
- `src/services/customersApi.js` - NEW centralized API service
- `src/components/CustomerSearchModal.vue` - Rewritten with real API
- `src/components/StartSaleModal.vue` - Updated to use customersApi

**Decolecta Endpoints Used**:
- DNI: `https://api.decolecta.com/v1/reniec/dni?numero={dni}`
- RUC: `https://api.decolecta.com/v1/sunat/ruc?numero={ruc}`

---

## 2025-10-18 - Improved Sale Initiation Flow

### ✅ New Features

#### Customer Document Capture on Sale Start
- **New StartSaleModal component**: Appears when creating a new sale
- **Document type selector**: DNI (8 digits) or RUC (11 digits)
- **Auto-validation**: Only allows numbers, enforces correct length
- **Customer search**: Searches existing customers by document
- **Quick customer creation**: If not found, allows creating new customer inline
- **Skip option**: Can skip customer selection and add later
- **Auto-focus**: Document input auto-focuses when modal opens

#### Improved "Guardar venta" Functionality
- **Enhanced save button**: Now validates that cart has products before saving
- **Unsaved changes tracking**: System tracks if current sale has unsaved modifications
- **Confirmation dialogs**:
  - When clicking "+ Nueva venta" with unsaved changes, asks to save or discard
  - When loading a saved sale with current unsaved sale, asks to save first
- **Visual feedback**: Clear messages when sale is saved

#### Automatic localStorage Management
- **Auto-save**: Sales automatically save to localStorage on cart/payment changes
- **Auto-cleanup**: Completed sales automatically deleted from localStorage after payment
- **Persistent state**: Can close browser and resume sales later
- **Multiple saved sales**: Support for saving multiple sales simultaneously

### 🔧 Technical Implementation

#### Files Created
- `/src/components/StartSaleModal.vue` - NEW modal for sale initiation with customer capture

#### Files Modified
- `/src/views/POS.vue`:
  - Added `showStartSaleModal` and `saleHasUnsavedChanges` state
  - Updated `newSale()` to show StartSaleModal and check for unsaved changes
  - Added `handleStartSale()` to handle modal response
  - Updated `saveSaleForLater()` to mark sale as saved
  - Updated `resumeSavedSale()` to mark as not having unsaved changes
  - Updated `resetSale()` to clear unsaved changes flag
  - Updated all cart modification functions to mark unsaved changes
  - Updated watcher to clear unsaved flag on auto-save
  - Auto-cleanup integrated with order completion

#### User Flow
1. User clicks "+ Nueva venta"
2. If current sale has unsaved changes → Confirm save or discard
3. StartSaleModal appears
4. User can:
   - Enter customer document → Search → Select existing or create new
   - Click "Omitir" to skip customer selection
5. Sale starts with or without customer
6. All cart changes automatically save to localStorage
7. When sale is completed (paid), it's automatically removed from localStorage

---

## 2025-10-18 - Order Creation & Sales Module

### ✅ Completed Features

#### API Integration Fixes
- **Fixed API endpoint route duplication**: Removed `/api/v1` prefix from all endpoint calls since baseURL already includes it
  - Updated `productsApi.js` endpoints (search, getProduct, updateStock, searchByBarcode)
  - Updated `ordersApi.js` endpoints (createOrder, getOrders, getOrder, getDailySummary)
- **Added Netlify SPA routing**: Created `public/_redirects` to fix 404 errors on page refresh

#### POS Order Creation - WORKING ✅
- **Fixed multiple backend errors**:
  - Corrected field name: `tiendaventa_total` → `tiendaventa_totalpagar`
  - Disabled automatic timestamps in OrderModel (table doesn't have update timestamp field)
  - **Critical fix**: Added `productotipo_id` and `tiendaproducto_sku` to OrderDetailModel `allowedFields`
    - CodeIgniter was silently filtering out these fields during insert
    - This was causing foreign key constraint errors
  - Implemented direct SQL query to get `productotipo_id` from productos table
- **Order creation now includes**:
  - Customer information (name, document, email, phone)
  - Order details with product SKU, name, quantity, price
  - Stock updates for each product
  - Payment method tracking
  - Unique order reference code (POS-YYYY-MM-NNNNNN)
  - Origin tracking (pos, web, api)

#### Duplicate Order Prevention
- Added `processingOrder` ref flag to prevent double-clicks
- Button disables and shows spinner during order processing
- Prevents creation of duplicate orders

#### Change Calculation Fix
- Fixed change calculation logic in PaymentModal
- Always charge full `remainingAmount`
- Calculate change as: `max(0, cashAmount - remainingAmount)`
- Added watcher to auto-calculate change when cash amount changes
- Display change amount in cart summary

#### Sales History Module - NEW
- **Complete implementation** of Sales.vue for viewing order history
- Features:
  - Order list with filters (source: pos, web, api)
  - Search functionality (debounced)
  - Status display (Aprobado, Pendiente, Rechazado, Creado)
  - Customer information
  - Payment method
  - Order details modal with raw JSON viewer for debugging
- **Field mapping** from database (Spanish) to display (English):
  ```javascript
  tiendaventa_id → id
  tiendaventa_codigoreferencia → order_number
  tiendaventa_nombres/apellidos → customer.name
  tiendaventa_totalpagar → total
  tiendaventa_pagado → status (0=rechazado, 1=pagado, 2=pendiente)
  tiendaventa_origen → source (pos/web/api)
  tiendaventa_fecha → created_at
  ```

### 🔧 Technical Details

#### Database Field Mappings
Key field names in `tiendasventas` table:
- `tiendaventa_totalpagar`: Total amount to pay
- `tiendaventa_pagado`: Payment status (0/1/2/9)
- `tiendaventa_origen`: Order source (pos/web/api)
- `tiendaventa_codigoreferencia`: Order reference code
- `tiendaventa_fecha`: Creation date

Key field names in `tiendasventasdetalles` table:
- `tiendaventa_id`: Foreign key to order
- `producto_id`: Foreign key to product
- `productotipo_id`: Foreign key to product type (REQUIRED for FK constraint)
- `tiendaproducto_sku`: Product SKU
- `tiendaventa_cantidad`: Quantity

#### CodeIgniter Model Protection
- Models use `allowedFields` array to protect against mass assignment
- Fields NOT in `allowedFields` are silently filtered during insert/update
- Always add fields to `allowedFields` when adding to database operations

#### Git Workflow
All backend changes deployed via: `git push live main:master`

### 🐛 Bugs Fixed

1. **Route duplication** (`/api/v1/api/v1/...`)
2. **Netlify 404 on page refresh**
3. **Unknown column 'tiendaventa_total'** - wrong field name
4. **Unknown column 'tiendaventa_fechamodificacion'** - timestamps issue
5. **Foreign key constraint on productotipo_id** - missing from allowedFields (CRITICAL)
6. **Duplicate orders** - double-click prevention
7. **Empty data in Sales module** - field mapping

### 📝 Files Modified

#### Frontend
- `/src/services/ordersApi.js` - Fixed endpoint paths
- `/src/services/productsApi.js` - Fixed endpoint paths
- `/src/views/POS.vue` - Added duplicate prevention
- `/src/components/PaymentModal.vue` - Fixed change calculation
- `/src/views/Sales.vue` - NEW complete implementation
- `/public/_redirects` - NEW SPA routing config

#### Backend (API)
- `/app/Controllers/V1/Order.php` - Fixed field names, added productotipo_id query
- `/app/Models/OrderModel.php` - Fixed allowedFields, disabled timestamps
- `/app/Models/OrderDetailModel.php` - Added productotipo_id and sku to allowedFields

### 🚀 Next Steps

#### Planned: Improved Sale Initiation Flow
- Customer document capture (DNI/RUC) at sale start
- "Skip" option to add customer later
- "Guardar venta" button to save sale locally
- Confirmation dialog when starting new sale with unsaved data
- localStorage management for saved sales
- Auto-cleanup completed sales from localStorage

---

## Previous Work (Summary)

### Initial Setup
- Created POS interface with product search and cart
- Integrated with MiTienda API (api2.mitienda.pe)
- Fixed CORS issues on backend
- Implemented authentication and user roles

### Product Management
- Product search by name, SKU, barcode
- Stock display and validation
- Price display with currency formatting
- Cart management (add, remove, update quantity)

### Payment Processing
- Multiple payment methods (efectivo, tarjeta, yape, plin, transferencia)
- Split payments support
- Change calculation
- Payment validation

### Deployment
- Automatic deployment to Netlify on git push
- Environment variable management
- Production API integration

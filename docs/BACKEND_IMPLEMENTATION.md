# Backend Implementation Guide - Orders & Webhooks

Este documento describe la implementación necesaria en el backend (CodeIgniter 4) para soportar las órdenes del POS y el sistema de webhooks.

## 📋 Endpoints a Implementar

### 1. POST /api/v1/orders - Crear Orden

**Ubicación**: `app/Controllers/V1/Order.php`

**Request Body**:
```json
{
  "customer_id": 123,
  "document_type": "boleta",
  "items": [
    {
      "product_id": 456,
      "sku": "PROD-001",
      "name": "Producto Ejemplo",
      "quantity": 2,
      "unit_price": 50.00,
      "subtotal": 100.00,
      "tax": 18.00,
      "total": 118.00
    }
  ],
  "payments": [
    {
      "method": "cash",
      "method_name": "Efectivo",
      "amount": 100.00,
      "reference": null
    }
  ],
  "subtotal": 100.00,
  "tax": 18.00,
  "tax_rate": 0.18,
  "total": 118.00,
  "currency": "PEN"
}
```

**Response Success (201)**:
```json
{
  "error": 0,
  "message": "Orden creada exitosamente",
  "data": {
    "order_id": 1234,
    "order_number": "ORD-2025-001234",
    "status": "completed",
    "created_at": "2025-10-17T14:30:00Z",
    "webhook_sent": true
  }
}
```

---

## 🔧 Implementación del Controlador

### Order.php

```php
<?php

namespace App\Controllers\V1;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\HTTP\ResponseInterface;

class Order extends ResourceController
{
    protected $modelName = 'App\Models\OrderModel';
    protected $format = 'json';

    /**
     * Crear una nueva orden
     * POST /api/v1/orders
     */
    public function create()
    {
        // Obtener datos del usuario autenticado
        $userId = $this->request->user['id'] ?? null;
        $storeId = $this->request->user['store_id'] ?? null;

        if (!$userId || !$storeId) {
            return $this->fail('Usuario o tienda no identificados', ResponseInterface::HTTP_UNAUTHORIZED);
        }

        // Validar datos de entrada
        $rules = [
            'items' => 'required|is_array',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|greater_than[0]',
            'items.*.unit_price' => 'required|numeric',
            'payments' => 'required|is_array',
            'payments.*.method' => 'required|string',
            'payments.*.amount' => 'required|numeric|greater_than[0]',
            'subtotal' => 'required|numeric',
            'tax' => 'required|numeric',
            'total' => 'required|numeric',
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors(), ResponseInterface::HTTP_BAD_REQUEST);
        }

        $data = $this->request->getJSON(true);

        // Iniciar transacción
        $db = \Config\Database::connect();
        $db->transStart();

        try {
            // 1. Crear la orden
            $orderModel = model('OrderModel');
            $orderData = [
                'store_id' => $storeId,
                'user_id' => $userId,
                'customer_id' => $data['customer_id'] ?? null,
                'order_number' => $this->generateOrderNumber($storeId),
                'document_type' => $data['document_type'] ?? 'boleta',
                'subtotal' => $data['subtotal'],
                'tax' => $data['tax'],
                'tax_rate' => $data['tax_rate'] ?? 0.18,
                'total' => $data['total'],
                'currency' => $data['currency'] ?? 'PEN',
                'status' => 'completed',
                'source' => 'pos', // Origen de la venta: 'web', 'pos', 'api'
                'created_at' => date('Y-m-d H:i:s')
            ];

            $orderId = $orderModel->insert($orderData);

            if (!$orderId) {
                throw new \Exception('Error al crear la orden');
            }

            // 2. Insertar items de la orden
            $orderItemModel = model('OrderItemModel');
            foreach ($data['items'] as $item) {
                $orderItemModel->insert([
                    'order_id' => $orderId,
                    'product_id' => $item['product_id'],
                    'sku' => $item['sku'] ?? '',
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['subtotal'],
                    'tax' => $item['tax'],
                    'total' => $item['total']
                ]);

                // 3. Actualizar stock del producto
                $productModel = model('ProductModel');
                $product = $productModel->find($item['product_id']);
                if ($product) {
                    $newStock = $product['stock'] - $item['quantity'];
                    $productModel->update($item['product_id'], ['stock' => $newStock]);
                }
            }

            // 4. Insertar pagos
            $orderPaymentModel = model('OrderPaymentModel');
            foreach ($data['payments'] as $payment) {
                $orderPaymentModel->insert([
                    'order_id' => $orderId,
                    'method' => $payment['method'],
                    'method_name' => $payment['method_name'],
                    'amount' => $payment['amount'],
                    'reference' => $payment['reference'] ?? null
                ]);
            }

            // Confirmar transacción
            $db->transComplete();

            if ($db->transStatus() === false) {
                throw new \Exception('Error en la transacción');
            }

            // 5. Disparar webhook (asíncrono)
            $this->sendWebhookNotification($orderId, $storeId);

            // 6. Retornar respuesta
            return $this->respondCreated([
                'error' => 0,
                'message' => 'Orden creada exitosamente',
                'data' => [
                    'order_id' => $orderId,
                    'order_number' => $orderData['order_number'],
                    'status' => 'completed',
                    'created_at' => $orderData['created_at'],
                    'webhook_sent' => true
                ]
            ]);

        } catch (\Exception $e) {
            $db->transRollback();
            log_message('error', 'Error creating order: ' . $e->getMessage());
            return $this->fail('Error al procesar la orden: ' . $e->getMessage(), ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Listar órdenes
     * GET /api/v1/orders
     */
    public function index()
    {
        $storeId = $this->request->user['store_id'] ?? null;

        if (!$storeId) {
            return $this->fail('Tienda no identificada', ResponseInterface::HTTP_UNAUTHORIZED);
        }

        $page = $this->request->getGet('page') ?? 1;
        $limit = $this->request->getGet('limit') ?? 20;
        $dateFrom = $this->request->getGet('date_from');
        $dateTo = $this->request->getGet('date_to');
        $source = $this->request->getGet('source'); // 'web', 'pos', 'api'

        $orderModel = model('OrderModel');
        $builder = $orderModel->where('store_id', $storeId);

        if ($dateFrom) {
            $builder->where('created_at >=', $dateFrom);
        }

        if ($dateTo) {
            $builder->where('created_at <=', $dateTo);
        }

        // Filtrar por origen (web, pos, api)
        if ($source) {
            $builder->where('source', $source);
        }

        $orders = $builder->orderBy('created_at', 'DESC')
                         ->paginate($limit, 'default', $page);

        return $this->respond([
            'error' => 0,
            'data' => $orders,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $orderModel->pager->getTotal()
            ]
        ]);
    }

    /**
     * Ver detalle de una orden
     * GET /api/v1/orders/{id}
     */
    public function show($id = null)
    {
        $storeId = $this->request->user['store_id'] ?? null;

        $orderModel = model('OrderModel');
        $order = $orderModel->find($id);

        if (!$order || $order['store_id'] != $storeId) {
            return $this->failNotFound('Orden no encontrada');
        }

        // Cargar items y pagos
        $orderItemModel = model('OrderItemModel');
        $orderPaymentModel = model('OrderPaymentModel');

        $order['items'] = $orderItemModel->where('order_id', $id)->findAll();
        $order['payments'] = $orderPaymentModel->where('order_id', $id)->findAll();

        return $this->respond([
            'error' => 0,
            'data' => $order
        ]);
    }

    /**
     * Generar número de orden único
     */
    private function generateOrderNumber($storeId)
    {
        $year = date('Y');
        $orderModel = model('OrderModel');
        $lastOrder = $orderModel->where('store_id', $storeId)
                                ->where('YEAR(created_at)', $year)
                                ->orderBy('id', 'DESC')
                                ->first();

        $sequence = $lastOrder ? intval(substr($lastOrder['order_number'], -6)) + 1 : 1;

        return sprintf('ORD-%s-%06d', $year, $sequence);
    }

    /**
     * Enviar notificación al webhook
     */
    private function sendWebhookNotification($orderId, $storeId)
    {
        // Obtener configuración del webhook
        $webhookConfigModel = model('WebhookConfigModel');
        $webhookConfig = $webhookConfigModel->where('store_id', $storeId)
                                           ->where('enabled', 1)
                                           ->first();

        if (!$webhookConfig || !$webhookConfig['webhook_url']) {
            return; // No hay webhook configurado
        }

        // Cargar datos completos de la orden
        $orderModel = model('OrderModel');
        $order = $orderModel->find($orderId);

        $orderItemModel = model('OrderItemModel');
        $orderPaymentModel = model('OrderPaymentModel');

        $order['items'] = $orderItemModel->where('order_id', $orderId)->findAll();
        $order['payments'] = $orderPaymentModel->where('order_id', $orderId)->findAll();

        // Preparar payload
        $payload = [
            'event' => 'order.created',
            'timestamp' => date('c'),
            'store_id' => $storeId,
            'order' => $order
        ];

        // Enviar webhook de forma asíncrona (usando queue o background job)
        // Por ahora lo hacemos síncrono para simplicidad
        try {
            $client = \Config\Services::curlrequest();

            $headers = [
                'Content-Type' => 'application/json',
            ];

            // Agregar autenticación si está configurada
            if ($webhookConfig['auth_type'] === 'bearer' && $webhookConfig['auth_token']) {
                $headers['Authorization'] = 'Bearer ' . $webhookConfig['auth_token'];
            }

            $response = $client->post($webhookConfig['webhook_url'], [
                'headers' => $headers,
                'json' => $payload,
                'timeout' => 30,
                'http_errors' => false
            ]);

            // Log del webhook
            $webhookLogModel = model('WebhookLogModel');
            $webhookLogModel->insert([
                'store_id' => $storeId,
                'order_id' => $orderId,
                'webhook_url' => $webhookConfig['webhook_url'],
                'payload' => json_encode($payload),
                'response_code' => $response->getStatusCode(),
                'response_body' => $response->getBody(),
                'created_at' => date('Y-m-d H:i:s')
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Webhook error: ' . $e->getMessage());

            // Log del error
            $webhookLogModel = model('WebhookLogModel');
            $webhookLogModel->insert([
                'store_id' => $storeId,
                'order_id' => $orderId,
                'webhook_url' => $webhookConfig['webhook_url'],
                'payload' => json_encode($payload),
                'response_code' => 0,
                'response_body' => $e->getMessage(),
                'created_at' => date('Y-m-d H:i:s')
            ]);
        }
    }
}
```

---

## 📊 Modelos Necesarios

### OrderModel.php
```php
<?php

namespace App\Models;

use CodeIgniter\Model;

class OrderModel extends Model
{
    protected $table = 'orders';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'store_id', 'user_id', 'customer_id', 'order_number',
        'document_type', 'subtotal', 'tax', 'tax_rate', 'total',
        'currency', 'status', 'source', 'created_at', 'updated_at'
    ];
    protected $useTimestamps = true;
}
```

### OrderItemModel.php
```php
<?php

namespace App\Models;

use CodeIgniter\Model;

class OrderItemModel extends Model
{
    protected $table = 'order_items';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'order_id', 'product_id', 'sku', 'name', 'quantity',
        'unit_price', 'subtotal', 'tax', 'total'
    ];
}
```

### OrderPaymentModel.php
```php
<?php

namespace App\Models;

use CodeIgniter\Model;

class OrderPaymentModel extends Model
{
    protected $table = 'order_payments';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'order_id', 'method', 'method_name', 'amount', 'reference'
    ];
}
```

### WebhookConfigModel.php
```php
<?php

namespace App\Models;

use CodeIgniter\Model;

class WebhookConfigModel extends Model
{
    protected $table = 'webhook_configs';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'store_id', 'webhook_url', 'auth_type', 'auth_token',
        'enabled', 'events', 'created_at', 'updated_at'
    ];
    protected $useTimestamps = true;
}
```

### WebhookLogModel.php
```php
<?php

namespace App\Models;

use CodeIgniter\Model;

class WebhookLogModel extends Model
{
    protected $table = 'webhook_logs';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'store_id', 'order_id', 'webhook_url', 'payload',
        'response_code', 'response_body', 'created_at'
    ];
}
```

---

## 🗃️ Migraciones SQL

### orders table
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    user_id INT NOT NULL,
    customer_id INT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    document_type ENUM('boleta', 'factura') DEFAULT 'boleta',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,4) DEFAULT 0.1800,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PEN',
    status VARCHAR(20) DEFAULT 'completed',
    source ENUM('web', 'pos', 'api') DEFAULT 'web' COMMENT 'Origen de la venta',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    INDEX idx_store_created (store_id, created_at),
    INDEX idx_source (source),
    INDEX idx_store_source (store_id, source),
    INDEX idx_order_number (order_number),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

**Migración para agregar campo `source` a tabla existente**:
```sql
-- Si la tabla orders ya existe, agregar el campo source
ALTER TABLE orders
ADD COLUMN source ENUM('web', 'pos', 'api') DEFAULT 'web' COMMENT 'Origen de la venta' AFTER status,
ADD INDEX idx_source (source),
ADD INDEX idx_store_source (store_id, source);

-- Actualizar ventas existentes como 'web' (por defecto)
UPDATE orders SET source = 'web' WHERE source IS NULL;
```

### order_items table
```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### order_payments table
```sql
CREATE TABLE order_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    method VARCHAR(50) NOT NULL,
    method_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reference VARCHAR(255) NULL,
    INDEX idx_order (order_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

### webhook_configs table
```sql
CREATE TABLE webhook_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    auth_type ENUM('none', 'bearer', 'basic', 'api_key') DEFAULT 'none',
    auth_token TEXT NULL,
    enabled TINYINT(1) DEFAULT 1,
    events JSON NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    UNIQUE KEY unique_store (store_id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);
```

### webhook_logs table
```sql
CREATE TABLE webhook_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    order_id INT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    payload TEXT NOT NULL,
    response_code INT NOT NULL,
    response_body TEXT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_store_created (store_id, created_at),
    INDEX idx_order (order_id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## 🔄 Actualización de Routes.php

Agregar en `app/Config/Routes.php`:

```php
$routes->group('api/v1', ['namespace' => 'App\Controllers\V1', 'filter' => 'auth'], static function ($routes) {
    // Orders
    $routes->post('orders', 'Order::create');
    $routes->get('orders', 'Order::index');
    $routes->get('orders/(:num)', 'Order::show/$1');

    // Webhooks configuration
    $routes->get('stores/(:num)/webhooks', 'Webhook::getConfig/$1');
    $routes->put('stores/(:num)/webhooks', 'Webhook::updateConfig/$1');
    $routes->post('webhooks/test', 'Webhook::test');
});
```

---

## ✅ Checklist de Implementación

- [ ] Crear migraciones SQL
- [ ] Crear modelos (Order, OrderItem, OrderPayment, WebhookConfig, WebhookLog)
- [ ] Implementar controlador Order.php
- [ ] Actualizar Routes.php
- [ ] Implementar controlador Webhook.php (configuración)
- [ ] Testing manual con Postman
- [ ] Testing desde el POS frontend
- [ ] Configurar webhook de prueba para NetSuite

---

## 🧪 Testing con Postman

**Crear Orden**:
```
POST https://api2.mitienda.pe/api/v1/orders
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body: (ver ejemplo al inicio del documento)
```

**Listar Órdenes**:
```
GET https://api2.mitienda.pe/api/v1/orders?page=1&limit=20&source=pos
Headers:
  Authorization: Bearer {access_token}
```

**Parámetros de filtro disponibles**:
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 20)
- `date_from`: Fecha desde (formato: Y-m-d)
- `date_to`: Fecha hasta (formato: Y-m-d)
- `source`: Origen de venta (`web`, `pos`, `api`)

**Ejemplos**:
- Todas las ventas del POS: `?source=pos`
- Todas las ventas de la web: `?source=web`
- Ventas del POS del día de hoy: `?source=pos&date_from=2025-10-17&date_to=2025-10-17`
- Todas las ventas (sin filtro de source): No agregar parámetro `source`

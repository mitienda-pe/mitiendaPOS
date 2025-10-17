# Backend Implementation - POS Orders

Esta guía describe la implementación real para soportar ventas del POS en el backend existente de MiTienda.

## 📊 Estado Actual

- ✅ La tabla `tiendasventas` ya existe y maneja ventas del eCommerce
- ✅ El controlador `/app/Controllers/V1/Order.php` ya existe
- ✅ Los modelos `OrderModel` y `OrderDetailModel` ya existen
- ✅ El `OrderTransformer` ya transforma las ventas para el API

## 🎯 Objetivo

Adaptar el sistema existente para:
1. Diferenciar ventas de **Web** vs **POS**
2. Crear endpoint simplificado para ventas del POS
3. Implementar sistema de webhooks para notificar a sistemas externos (Oracle NetSuite)

---

## 1️⃣ Migración SQL - Agregar campo `source`

```sql
-- Agregar campo para diferenciar origen de ventas
ALTER TABLE tiendasventas
ADD COLUMN tiendaventa_origen ENUM('web', 'pos', 'api') DEFAULT 'web'
COMMENT 'Origen de la venta: web (eCommerce), pos (Punto de Venta), api (Integraciones)'
AFTER tiendaventa_pagado;

-- Agregar índices para filtrado rápido
ALTER TABLE tiendasventas
ADD INDEX idx_origen (tiendaventa_origen),
ADD INDEX idx_tienda_origen (tienda_id, tiendaventa_origen);

-- Actualizar ventas existentes como 'web' (por defecto)
UPDATE tiendasventas
SET tiendaventa_origen = 'web'
WHERE tiendaventa_origen IS NULL OR tiendaventa_origen = '';
```

---

## 2️⃣ Actualizar OrderModel

**Archivo**: `/app/Models/OrderModel.php`

Agregar `'tiendaventa_origen'` al array `$allowedFields`:

```php
protected $allowedFields = [
    'tienda_id',
    'tiendacliente_id',
    'tiendaventa_codigoreferencia',
    'tiendaventa_fecha',
    'tiendaventa_pagado',
    'tiendaventa_origen',  // ← AGREGAR ESTA LÍNEA
    'tiendaventa_montoenvio',
    // ... resto de campos
];
```

---

## 3️⃣ Crear Nuevo Método en Order Controller

**Archivo**: `/app/Controllers/V1/Order.php`

Agregar este método nuevo para crear órdenes desde el POS:

```php
/**
 * Crear orden desde el POS
 * POST /api/v1/orders/pos
 */
public function createFromPOS()
{
    // Obtener tienda_id del token auth
    $tienda_id = $this->request->tienda_id;
    $user_id = $this->request->user_id ?? null;

    if (!$tienda_id) {
        return $this->fail('Tienda no identificada', 401);
    }

    $data = $this->request->getJSON(true);

    // Validación
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
        return $this->fail($this->validator->getErrors(), 400);
    }

    $this->model->db->transStart();

    try {
        // 1. Crear orden principal
        $orderNumber = $this->generateOrderNumber($tienda_id, 'POS');

        $orderData = [
            'tienda_id' => $tienda_id,
            'tiendacliente_id' => $data['customer_id'] ?? null,
            'tiendaventa_codigoreferencia' => $orderNumber,
            'tiendaventa_fecha' => date('Y-m-d H:i:s'),
            'tiendaventa_pagado' => 1, // POS siempre es pagado
            'tiendaventa_origen' => 'pos', // ← IMPORTANTE
            'tiendaventa_total' => $data['total'],
            'tiendaventa_montoenvio' => 0, // POS no tiene envío
            'tiendaventa_entregaadomicilio' => 0,
            'tiendaventa_recojoentienda' => 0,
            'moneda_id' => 1, // PEN por defecto
            'tiendaventa_nombres' => $data['customer_name'] ?? 'Cliente General',
            'tiendaventa_apellidos' => '',
            'tiendaventa_correoelectronico' => $data['customer_email'] ?? '',
            'tiendaventa_telefono' => $data['customer_phone'] ?? '',
            'tiendaventa_numerodocumento' => $data['customer_document'] ?? '',
            'documento_id_facturacion' => $this->getDocumentTypeId($data['document_type'] ?? 'boleta'),
            'pasarela_id' => $this->getPaymentGatewayId($data['payments'][0]['method'] ?? 'cash')
        ];

        $orderId = $this->model->insert($orderData);

        if (!$orderId) {
            throw new \Exception('Error al crear la orden');
        }

        // 2. Insertar items
        $orderDetailModel = new OrderDetailModel();
        $productModel = model('ProductModel');

        foreach ($data['items'] as $item) {
            $orderDetailModel->insert([
                'tiendaventa_id' => $orderId,
                'producto_id' => $item['product_id'],
                'producto_codigo' => $item['sku'] ?? '',
                'tiendaproducto_titulo' => $item['name'],
                'tiendaventa_cantidad' => $item['quantity'],
                'tiendaproducto_precio' => $item['unit_price']
            ]);

            // 3. Actualizar stock del producto
            $product = $productModel->find($item['product_id']);
            if ($product) {
                $newStock = max(0, $product['tiendaproducto_stock'] - $item['quantity']);
                $productModel->update($item['product_id'], ['tiendaproducto_stock' => $newStock]);
            }
        }

        // 4. Guardar información de pagos (en tabla auxiliar)
        $this->savePOSPayments($orderId, $data['payments']);

        // Confirmar transacción
        $this->model->db->transComplete();

        if ($this->model->db->transStatus() === false) {
            throw new \Exception('Error en la transacción');
        }

        // 5. Disparar webhook (asíncrono)
        $this->sendWebhookNotification($orderId, $tienda_id, $orderData, $data['items'], $data['payments']);

        // 6. Respuesta
        return $this->respondCreated([
            'error' => 0,
            'message' => 'Orden creada exitosamente',
            'data' => [
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'status' => 'completed',
                'created_at' => $orderData['tiendaventa_fecha'],
                'webhook_sent' => true
            ]
        ]);

    } catch (\Exception $e) {
        $this->model->db->transRollback();
        log_message('error', 'Error creating POS order: ' . $e->getMessage());
        return $this->fail('Error al procesar la orden: ' . $e->getMessage(), 500);
    }
}

/**
 * Generar número de orden único
 */
private function generateOrderNumber($storeId, $prefix = 'WEB')
{
    $year = date('Y');
    $month = date('m');

    // Obtener última orden de la tienda en el año actual
    $lastOrder = $this->model->where('tienda_id', $storeId)
                             ->where('YEAR(tiendaventa_fecha)', $year)
                             ->orderBy('tiendaventa_id', 'DESC')
                             ->first();

    $sequence = 1;
    if ($lastOrder && !empty($lastOrder['tiendaventa_codigoreferencia'])) {
        // Extraer el número de secuencia del último código
        preg_match('/\d+$/', $lastOrder['tiendaventa_codigoreferencia'], $matches);
        if ($matches) {
            $sequence = intval($matches[0]) + 1;
        }
    }

    return sprintf('%s-%s-%s-%06d', $prefix, $year, $month, $sequence);
}

/**
 * Obtener ID del tipo de documento
 */
private function getDocumentTypeId($type)
{
    $map = [
        'boleta' => 1,
        'factura' => 2
    ];
    return $map[$type] ?? 1;
}

/**
 * Mapear método de pago a pasarela_id
 */
private function getPaymentGatewayId($method)
{
    $map = [
        'cash' => 4,        // Pago Contra Entrega (lo más cercano a efectivo)
        'card' => 2,        // Culqi (tarjetas)
        'transfer' => 5,    // Depósito/Transferencia
        'yape' => 12,       // Yape
        'plin' => 10        // Plin
    ];
    return $map[$method] ?? 4;
}

/**
 * Guardar información de pagos del POS
 * (Crear tabla auxiliar: tiendasventas_pagos_pos)
 */
private function savePOSPayments($orderId, $payments)
{
    $db = \Config\Database::connect('mitienda');
    $builder = $db->table('tiendasventas_pagos_pos');

    foreach ($payments as $payment) {
        $builder->insert([
            'tiendaventa_id' => $orderId,
            'metodo' => $payment['method'],
            'metodo_nombre' => $payment['method_name'],
            'monto' => $payment['amount'],
            'referencia' => $payment['reference'] ?? null,
            'fecha' => date('Y-m-d H:i:s')
        ]);
    }
}

/**
 * Enviar notificación al webhook
 */
private function sendWebhookNotification($orderId, $storeId, $orderData, $items, $payments)
{
    // Obtener configuración del webhook
    $db = \Config\Database::connect('mitienda');
    $webhookConfig = $db->table('webhooks_config')
                        ->where('tienda_id', $storeId)
                        ->where('enabled', 1)
                        ->get()
                        ->getRowArray();

    if (!$webhookConfig || empty($webhookConfig['webhook_url'])) {
        log_message('info', "No webhook configured for store {$storeId}");
        return;
    }

    // Preparar payload
    $payload = [
        'event' => 'order.created',
        'timestamp' => date('c'),
        'store_id' => $storeId,
        'store_name' => '', // TODO: obtener nombre de tienda
        'order' => [
            'id' => $orderData['tiendaventa_codigoreferencia'],
            'order_number' => $orderData['tiendaventa_codigoreferencia'],
            'created_at' => $orderData['tiendaventa_fecha'],
            'status' => 'completed',
            'source' => 'pos',
            'subtotal' => $orderData['tiendaventa_total'] - ($orderData['tiendaventa_total'] * 0.18),
            'tax' => $orderData['tiendaventa_total'] * 0.18,
            'tax_rate' => 0.18,
            'total' => $orderData['tiendaventa_total'],
            'currency' => 'PEN',
            'document_type' => 'boleta',
            'customer' => [
                'name' => $orderData['tiendaventa_nombres'],
                'email' => $orderData['tiendaventa_correoelectronico'],
                'phone' => $orderData['tiendaventa_telefono'],
                'document_type' => 'DNI',
                'document_number' => $orderData['tiendaventa_numerodocumento']
            ],
            'items' => array_map(function($item) {
                return [
                    'product_id' => $item['product_id'],
                    'sku' => $item['sku'] ?? '',
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                    'tax' => ($item['quantity'] * $item['unit_price']) * 0.18,
                    'total' => ($item['quantity'] * $item['unit_price']) * 1.18
                ];
            }, $items),
            'payments' => $payments
        ]
    ];

    // Enviar en background (o usar queue)
    try {
        $client = \Config\Services::curlrequest();

        $headers = ['Content-Type' => 'application/json'];

        // Agregar autenticación
        if ($webhookConfig['auth_type'] === 'bearer' && !empty($webhookConfig['auth_token'])) {
            $headers['Authorization'] = 'Bearer ' . $webhookConfig['auth_token'];
        }

        $response = $client->post($webhookConfig['webhook_url'], [
            'headers' => $headers,
            'json' => $payload,
            'timeout' => 30,
            'http_errors' => false
        ]);

        // Log del webhook
        $db->table('webhooks_log')->insert([
            'tienda_id' => $storeId,
            'tiendaventa_id' => $orderId,
            'webhook_url' => $webhookConfig['webhook_url'],
            'payload' => json_encode($payload),
            'response_code' => $response->getStatusCode(),
            'response_body' => $response->getBody(),
            'fecha' => date('Y-m-d H:i:s')
        ]);

        log_message('info', "Webhook sent successfully for order {$orderId}");

    } catch (\Exception $e) {
        log_message('error', 'Webhook error: ' . $e->getMessage());

        // Log del error
        $db->table('webhooks_log')->insert([
            'tienda_id' => $storeId,
            'tiendaventa_id' => $orderId,
            'webhook_url' => $webhookConfig['webhook_url'],
            'payload' => json_encode($payload),
            'response_code' => 0,
            'response_body' => $e->getMessage(),
            'fecha' => date('Y-m-d H:i:s')
        ]);
    }
}
```

---

## 4️⃣ Actualizar método index() para filtrar por origen

En el método `index()` existente del controlador Order.php, agregar filtro por origen:

```php
public function index()
{
    // ... código existente ...

    $page = $this->request->getGet('page') ?? 1;
    $limit = $this->request->getGet('limit') ?? 20;
    $offset = ($page - 1) * $limit;
    $search = $this->request->getGet('search');
    $status = $this->request->getGet('status');
    $source = $this->request->getGet('source'); // ← AGREGAR ESTA LÍNEA

    // Start building the query
    $this->model->where('tienda_id', $tienda_id);

    // Filter by allowed statuses
    if ($status !== null && $status !== '' && in_array($status, ['0', '1', '2'])) {
        $this->model->where('tiendaventa_pagado', $status);
    } else {
        $this->model->whereIn('tiendaventa_pagado', [0, 1, 2]);
    }

    // ← AGREGAR ESTE BLOQUE
    // Filter by source (web, pos, api)
    if ($source && in_array($source, ['web', 'pos', 'api'])) {
        $this->model->where('tiendaventa_origen', $source);
    }

    // ... resto del código existente ...
}
```

---

## 5️⃣ Migraciones SQL - Tablas Auxiliares

### Tabla para pagos del POS

```sql
CREATE TABLE IF NOT EXISTS tiendasventas_pagos_pos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tiendaventa_id INT NOT NULL,
    metodo VARCHAR(50) NOT NULL COMMENT 'cash, card, transfer, etc',
    metodo_nombre VARCHAR(100) NOT NULL COMMENT 'Efectivo, Tarjeta, etc',
    monto DECIMAL(10,2) NOT NULL,
    referencia VARCHAR(255) NULL COMMENT 'Número de operación, autorización, etc',
    fecha DATETIME NOT NULL,
    INDEX idx_tiendaventa (tiendaventa_id),
    FOREIGN KEY (tiendaventa_id) REFERENCES tiendasventas(tiendaventa_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla de configuración de webhooks

```sql
CREATE TABLE IF NOT EXISTS webhooks_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    auth_type ENUM('none', 'bearer', 'basic', 'api_key') DEFAULT 'none',
    auth_token TEXT NULL,
    enabled TINYINT(1) DEFAULT 1,
    events JSON NULL COMMENT 'Eventos habilitados: order.created, order.updated, etc',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    UNIQUE KEY unique_tienda (tienda_id),
    FOREIGN KEY (tienda_id) REFERENCES tiendas(tienda_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla de logs de webhooks

```sql
CREATE TABLE IF NOT EXISTS webhooks_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    tiendaventa_id INT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    payload TEXT NOT NULL,
    response_code INT NOT NULL,
    response_body TEXT NULL,
    fecha DATETIME NOT NULL,
    INDEX idx_tienda_fecha (tienda_id, fecha),
    INDEX idx_tiendaventa (tiendaventa_id),
    FOREIGN KEY (tienda_id) REFERENCES tiendas(tienda_id) ON DELETE CASCADE,
    FOREIGN KEY (tiendaventa_id) REFERENCES tiendasventas(tiendaventa_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 6️⃣ Actualizar Routes.php

Agregar en `/app/Config/Routes.php`:

```php
$routes->group('api/v1', ['namespace' => 'App\Controllers\V1', 'filter' => 'auth'], static function ($routes) {
    // ... rutas existentes ...

    // Órdenes POS
    $routes->post('orders/pos', 'Order::createFromPOS');

    // Las rutas existentes funcionan para listar y ver detalles
    // $routes->get('orders', 'Order::index');           // Ya existe
    // $routes->get('orders/(:num)', 'Order::show/$1');  // Ya existe
});
```

---

## 7️⃣ Testing con Postman

### Crear Orden desde POS

```
POST https://api2.mitienda.pe/api/v1/orders/pos
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "customer_id": null,
  "customer_name": "Cliente General",
  "customer_document": "12345678",
  "document_type": "boleta",
  "items": [
    {
      "product_id": 123,
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
      "amount": 118.00,
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

### Listar Ventas del POS

```
GET https://api2.mitienda.pe/api/v1/orders?source=pos&page=1&limit=20
Headers:
  Authorization: Bearer {access_token}
```

### Listar Todas las Ventas (Web + POS)

```
GET https://api2.mitienda.pe/api/v1/orders?page=1&limit=20
Headers:
  Authorization: Bearer {access_token}
```

---

## ✅ Checklist de Implementación

- [ ] Ejecutar migración SQL para agregar campo `tiendaventa_origen`
- [ ] Actualizar `OrderModel` con nuevo campo en `$allowedFields`
- [ ] Crear tablas auxiliares (pagos_pos, webhooks_config, webhooks_log)
- [ ] Agregar método `createFromPOS()` en `Order.php`
- [ ] Actualizar método `index()` para filtrar por `source`
- [ ] Actualizar `Routes.php`
- [ ] Testing con Postman
- [ ] Configurar webhook de prueba para la tienda 10715
- [ ] Testing desde el frontend POS

---

## 🔗 Integración con Oracle NetSuite

Para la tienda 10715, configurar el webhook:

```sql
INSERT INTO webhooks_config (tienda_id, webhook_url, auth_type, auth_token, enabled, events, created_at)
VALUES (
    10715,
    'https://sistema-cliente.com/api/webhooks/orders',  -- URL del cliente
    'bearer',  -- o 'basic', 'api_key'
    'sk_live_xxxxxxxxxxxxxx',  -- Token proporcionado por el cliente
    1,
    '["order.created"]',
    NOW()
);
```

El cliente recibirá el payload documentado en el [PRD.md](PRD.md) sección 7.4.

-- =====================================================
-- Migración: Crear tablas auxiliares para POS
-- Descripción: Tablas para pagos múltiples y webhooks
-- Fecha: 2025-10-17
-- =====================================================

-- 1. Tabla para registrar múltiples métodos de pago del POS
CREATE TABLE IF NOT EXISTS tiendasventas_pagos_pos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tiendaventa_id INT NOT NULL,
    metodo VARCHAR(50) NOT NULL COMMENT 'cash, card, transfer, yape, plin, etc',
    metodo_nombre VARCHAR(100) NOT NULL COMMENT 'Efectivo, Tarjeta, Transferencia, etc',
    monto DECIMAL(10,2) NOT NULL,
    referencia VARCHAR(255) NULL COMMENT 'Número de operación, autorización, código de transacción',
    fecha DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tiendaventa (tiendaventa_id),
    INDEX idx_fecha (fecha),
    FOREIGN KEY (tiendaventa_id) REFERENCES tiendasventas(tiendaventa_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de múltiples métodos de pago utilizados en cada venta del POS';

-- 2. Tabla de configuración de webhooks por tienda
CREATE TABLE IF NOT EXISTS webhooks_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    auth_type ENUM('none', 'bearer', 'basic', 'api_key') DEFAULT 'none'
        COMMENT 'Tipo de autenticación: none, bearer token, basic auth, api key',
    auth_token TEXT NULL
        COMMENT 'Token o credenciales de autenticación cifradas',
    enabled TINYINT(1) DEFAULT 1
        COMMENT '1=activo, 0=desactivado',
    events JSON NULL
        COMMENT 'Eventos habilitados: ["order.created", "order.updated", "order.cancelled"]',
    retry_enabled TINYINT(1) DEFAULT 1
        COMMENT 'Reintentar envío en caso de fallo',
    max_retries INT DEFAULT 3
        COMMENT 'Número máximo de reintentos',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_tienda (tienda_id),
    INDEX idx_enabled (enabled),
    FOREIGN KEY (tienda_id) REFERENCES tiendas(tienda_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración de webhooks para notificaciones a sistemas externos';

-- 3. Tabla de logs de webhooks (auditoría)
CREATE TABLE IF NOT EXISTS webhooks_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    tiendaventa_id INT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    event_type VARCHAR(50) NULL COMMENT 'order.created, order.updated, etc',
    payload MEDIUMTEXT NOT NULL COMMENT 'JSON payload enviado',
    response_code INT NOT NULL COMMENT 'HTTP status code de la respuesta',
    response_body TEXT NULL COMMENT 'Respuesta del servidor webhook',
    retry_count INT DEFAULT 0 COMMENT 'Número de reintento (0 = primer intento)',
    fecha DATETIME NOT NULL,
    INDEX idx_tienda_fecha (tienda_id, fecha),
    INDEX idx_tiendaventa (tiendaventa_id),
    INDEX idx_response_code (response_code),
    INDEX idx_event_type (event_type),
    FOREIGN KEY (tienda_id) REFERENCES tiendas(tienda_id) ON DELETE CASCADE,
    FOREIGN KEY (tiendaventa_id) REFERENCES tiendasventas(tiendaventa_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de todas las llamadas a webhooks para auditoría y debugging';

-- 4. Ejemplo de configuración para tienda 10715 (Oracle NetSuite)
-- Descomentar y ajustar cuando tengas la URL y token del cliente:
/*
INSERT INTO webhooks_config (tienda_id, webhook_url, auth_type, auth_token, enabled, events, created_at)
VALUES (
    10715,
    'https://sistema-cliente.com/api/webhooks/mitienda/orders',  -- URL proporcionada por el cliente
    'bearer',  -- Tipo de autenticación
    'sk_live_xxxxxxxxxxxxxx',  -- Token proporcionado por el cliente
    1,  -- Habilitado
    '["order.created", "order.updated"]',  -- Eventos a notificar
    NOW()
);
*/

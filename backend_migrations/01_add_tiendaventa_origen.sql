-- =====================================================
-- Migración: Agregar campo tiendaventa_origen
-- Descripción: Diferencia ventas de Web, POS y API
-- Fecha: 2025-10-17
-- =====================================================

-- 1. Agregar campo para diferenciar origen de ventas
ALTER TABLE tiendasventas
ADD COLUMN tiendaventa_origen ENUM('web', 'pos', 'api') DEFAULT NULL
COMMENT 'Origen de la venta: web (eCommerce), pos (Punto de Venta), api (Integraciones)'
AFTER tiendaventa_pagado;

-- 2. Agregar índices para filtrado rápido
ALTER TABLE tiendasventas
ADD INDEX idx_origen (tiendaventa_origen),
ADD INDEX idx_tienda_origen (tienda_id, tiendaventa_origen);

-- NOTA: No es necesario actualizar registros existentes
-- Si tiendaventa_origen es NULL o vacío, se asume que es 'web' (tienda virtual)
-- Esta lógica se maneja en el código de la aplicación

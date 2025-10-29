#!/bin/bash

# Script para probar el proxy al API legacy

echo "========================================="
echo "0. Autenticando y seleccionando tienda 12097"
echo "========================================="

# Primero login
LOGIN_RESPONSE=$(curl -s -X POST https://api2.mitienda.pe/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos@mitienda.pe","password":"aq6cgMbFXEjCKys"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])")

echo "Token obtenido: ${TOKEN:0:50}..."

# Seleccionar tienda 12097
SELECT_RESPONSE=$(curl -s -X POST https://api2.mitienda.pe/api/v1/user/store/select \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"store_id":12097}')

# Obtener nuevo token con la tienda correcta
TOKEN=$(echo $SELECT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])")

echo "Tienda 12097 seleccionada"
echo "Nuevo token: ${TOKEN:0:50}..."
echo ""

echo "========================================="
echo "1. Probando GET /api/v1/auth/legacy-token"
echo "========================================="
curl -s "https://api2.mitienda.pe/api/v1/auth/legacy-token" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool

echo ""
echo "========================================="
echo "2. Probando POST /api/v1/orders/legacy"
echo "========================================="
curl -s -X POST "https://api2.mitienda.pe/api/v1/orders/legacy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": 303492,
        "quantity": 1,
        "unit_price": 10.00,
        "name": "Producto de Prueba",
        "sku": "TEST-001"
      }
    ],
    "customer": {
      "name": "Cliente Prueba",
      "email": "prueba@test.com",
      "phone": "999999999",
      "document_number": "12345678"
    },
    "document_type": "boleta",
    "payments": [
      {
        "method": "cash",
        "amount": 10.00
      }
    ],
    "notes": "Orden de prueba desde proxy"
  }' | python3 -m json.tool

echo ""
echo "========================================="
echo "✅ Pruebas completadas"
echo "========================================="

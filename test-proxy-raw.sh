#!/bin/bash

# Script para probar el proxy con payload legacy directo

echo "========================================="
echo "Autenticando y seleccionando tienda 12097"
echo "========================================="

# Login
LOGIN_RESPONSE=$(curl -s -X POST https://api2.mitienda.pe/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos@mitienda.pe","password":"aq6cgMbFXEjCKys"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])")

# Seleccionar tienda 12097
SELECT_RESPONSE=$(curl -s -X POST https://api2.mitienda.pe/api/v1/user/store/select \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"store_id":12097}')

TOKEN=$(echo $SELECT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])")

echo "✅ Autenticado con tienda 12097"
echo ""

echo "========================================="
echo "Probando POST /api/v1/orders/legacy"
echo "Con payload en formato legacy DIRECTO"
echo "========================================="

curl -v -X POST "https://api2.mitienda.pe/api/v1/orders/legacy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tienda_id": "12097",
    "tiendacliente_id": "",
    "tiendaventa_tipocliente": "1",
    "facturacionRazonSocial": "",
    "facturacionClienteNombre": "Cliente",
    "facturacionClienteApellido": "Prueba",
    "facturacionClienteDocumento": "1",
    "facturacionClienteNumero": "12345678",
    "facturacionClienteEmail": "prueba@test.com",
    "facturacionClienteTelefono": "999999999",
    "facturacionClienteDireccion": "",
    "envioClienteNombre": "Cliente",
    "envioClienteApellido": "Prueba",
    "envioClienteDocumento": "1",
    "envioClienteNumero": "12345678",
    "envioClienteTelefono": "999999999",
    "envioClienteDireccion": "",
    "envioClienteReferencia": "",
    "envioClienteEmail": "prueba@test.com",
    "precioEnvio": "0.00",
    "tipoCambio": "3.90",
    "tiendaventa_mensaje": "",
    "sw_mostrarhorarioenvio": "0",
    "cantidad_horarios": "0",
    "tiendaventa_tipofechareparto": "0",
    "tiendaventa_fechareparto": "",
    "tiendaventa_diasemanareparto": "",
    "tiendaventa_horareparto": "",
    "ubigeo_facturacionpaisid": "1",
    "ubigeo_facturaciondptotexto": "",
    "ubigeo_facturacionprovtexto": "",
    "ubigeo_facturaciondisttexto": "",
    "ubigeo_enviopaisid": "1",
    "ubigeo_enviodptotexto": "",
    "ubigeo_envioprovtexto": "",
    "ubigeo_enviodisttexto": "",
    "pasarela_id": "4",
    "tiendaventa_latitudenvio": "",
    "tiendaventa_longitudenvio": "",
    "tiendaventa_zipenvio": "",
    "courier_id": "0",
    "envioClienteDireccionInterior": "",
    "facturacionClienteDepartamento": "0",
    "facturacionClienteProvincia": "",
    "facturacionClienteDistrito": "",
    "envioClienteDepartamento": "0",
    "envioClienteProvincia": "0",
    "envioClienteDistrito": "0",
    "modo_de_entrega": "0",
    "tiendadireccion_id": "",
    "sw_gurdardireccion": "0",
    "enviar_misma_direccion": "1",
    "sw_mostrarhorarioRecojoTienda": "0",
    "horarioRecojo": "",
    "tiendaventa_tipofechaRecojoTienda": "0",
    "tiendaventa_fechaRecojoTienda": "",
    "tiendaventa_diasemanaRecojoTienda": "",
    "tiendaventa_horaRecojoTienda": "",
    "ubigeoid_envio": "",
    "referralCode": "",
    "cart": [
      {
        "id": "303492",
        "pfijo": "1",
        "atributoId": "",
        "tiendaunidadvalor": "",
        "txtICantidad": "1",
        "tienda_id": "12097"
      }
    ]
  }' 2>&1 | grep -A 20 "< HTTP"

echo ""
echo "========================================="
echo "✅ Prueba completada"
echo "========================================="

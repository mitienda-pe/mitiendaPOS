# Manejo de Pagos Combinados en un POS

## 1. Modelo de Pagos Combinados en un POS

El sistema debe permitir que una venta se divida en múltiples métodos de pago hasta completar el **total de la transacción**.

### 🔹 Ejemplo:

Una compra de **S/ 150.00** puede ser pagada de la siguiente forma:

- **S/ 50.00 en efectivo**
- **S/ 70.00 con tarjeta de débito**
- **S/ 30.00 con una gift card**

---

## 2. Esquema de Base de Datos para Pagos Parciales

Para manejar múltiples pagos en una misma venta, se suele usar una tabla intermedia de **pagos por venta**:

### **Tabla **``** (Cabecera de venta)**

| id\_venta | cliente\_id | total  | estado    |
| --------- | ----------- | ------ | --------- |
| 1001      | 15          | 150.00 | PAGADO    |
| 1002      | 22          | 80.00  | PENDIENTE |

### **Tabla **``** (Pagos asociados a una venta)**

| id\_pago | id\_venta | tipo\_pago | monto | referencia                  |
| -------- | --------- | ---------- | ----- | --------------------------- |
| 2001     | 1001      | EFECTIVO   | 50.00 | NULL                        |
| 2002     | 1001      | TARJETA    | 70.00 | 1234-XXXX-5678 (VISA)       |
| 2003     | 1001      | GIFT CARD  | 30.00 | GC-987654321                |
| 2004     | 1002      | TARJETA    | 40.00 | 5678-XXXX-1234 (MASTERCARD) |

✅ **Ventajas de esta estructura:**

- Permite múltiples pagos por venta
- Se pueden registrar distintas referencias (número de tarjeta, código de vale, etc.)
- Si el **total de los pagos aún no cubre el monto de la venta**, el estado se mantiene como **"PENDIENTE"** hasta completarlo.

---

## 3. Flujo de Pago en la Aplicación POS

1️⃣ **Inicio de Venta**

- El cajero selecciona los productos y se muestra el **total** a pagar.

2️⃣ **Selección de Método de Pago**

- Se presenta una opción para **agregar pagos parciales** con distintos métodos.
- Cada pago ingresado **resta del saldo pendiente**.

3️⃣ **Manejo de Saldos Insuficientes**

- Si un pago (como una **gift card**) no cubre el total, el sistema **muestra el saldo pendiente** y permite agregar otro método.

4️⃣ **Cierre de Venta**

- Una vez que la suma de los pagos **cubre el total**, se cambia el estado de la venta a **"PAGADO"**.
- Se genera el ticket o factura.

---

## 4. Interfaz de Usuario en el POS

### 📌 **Pantalla de Pago:**

| Método de Pago | Monto Ingresado | Saldo Pendiente      |
| -------------- | --------------- | -------------------- |
| Tarjeta Visa   | S/ 70.00        | S/ 80.00             |
| Gift Card      | S/ 30.00        | S/ 50.00             |
| **Efectivo**   | **S/ 50.00**    | **S/ 0.00** ✅ PAGADO |

Con botones como: ✅ **Agregar Pago**\
❌ **Eliminar Pago**\
💾 **Confirmar Venta**

---

## 5. Integración con Facturación Electrónica

Si el POS está conectado con un sistema como **Nubefact**, la facturación debe reflejar los múltiples pagos en el comprobante.

Ejemplo en **JSON de Facturación Electrónica**:

```json
{
  "tipo_comprobante": "BOLETA",
  "cliente": "Juan Pérez",
  "total": 150.00,
  "pagos": [
    { "metodo": "EFECTIVO", "monto": 50.00 },
    { "metodo": "TARJETA", "monto": 70.00, "referencia": "1234-XXXX-5678" },
    { "metodo": "GIFT_CARD", "monto": 30.00, "referencia": "GC-987654321" }
  ]
}
```

---

## 6. Consideraciones Técnicas para Implementación

- **Manejo de Redondeo:** Evitar problemas con decimales al dividir pagos.
- **Transacciones en Base de Datos:** Usar **transacciones SQL** para evitar inconsistencias.
- **Registro de Devoluciones:** Si la venta se cancela, deben reembolsarse los pagos individuales.
- **Soporte para Hardware:** Integración con terminales de pago, lector de códigos de barras y ticketera térmica.

---

## Resumen

✅ **La clave es tratar el pago como una colección de múltiples métodos en una misma venta.**\
✅ **Siempre debe mantenerse un saldo pendiente hasta completar el pago total.**\
✅ **El POS debe ser intuitivo para facilitar combinaciones de pagos en tiempo real.**

¿Necesitas ayuda con la implementación de algún módulo en específico? 🚀


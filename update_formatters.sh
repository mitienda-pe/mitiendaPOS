#!/bin/bash
# Script para actualizar formatCurrency en todos los archivos del POS

# Archivos a actualizar
files=(
  "src/components/MergeSalesModal.vue"
  "src/components/SavedSalesModal.vue"
  "src/components/CloseShiftModal.vue"
  "src/components/BillingDocumentModal.vue"
  "src/components/TicketModal.vue"
  "src/views/Sales.vue"
  "src/views/Inventory.vue"
  "src/views/Documents.vue"
)

cd /Users/carlosvidal/www/mitienda/mitienda-POS

for file in "${files[@]}"; do
  echo "Procesando $file..."

  # Verificar si el archivo ya tiene el import
  if ! grep -q "import { formatCurrency } from" "$file"; then
    echo "  - Agregando import de formatCurrency..."

    # Encontrar la última línea de import y agregar después
    # Buscar el número de línea del último import
    last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)

    if [ ! -z "$last_import_line" ]; then
      # Insertar el import después del último import existente
      sed -i.bak "${last_import_line}a\\
import { formatCurrency } from '../utils/formatters.js';
" "$file"
    fi
  fi

  # Comentar la definición local de formatCurrency
  sed -i.bak 's/const formatCurrency = /\/\/ const formatCurrency = /' "$file"
  sed -i.bak 's/function formatCurrency(/\/\/ function formatCurrency(/' "$file"

  echo "  ✓ Actualizado"
done

echo ""
echo "✅ Todos los archivos han sido actualizados"
echo "Los archivos .bak contienen los originales por si necesitas revertir"

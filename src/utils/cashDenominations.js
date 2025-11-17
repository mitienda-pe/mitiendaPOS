/**
 * Utilidades para manejo de denominaciones de efectivo en Perú
 *
 * Denominaciones vigentes:
 * - Billetes: 200, 100, 50, 20, 10
 * - Monedas: 5, 2, 1, 0.50, 0.20, 0.10
 *
 * Nota: Las monedas de 0.01 y 0.05 ya no circulan
 */

// Denominaciones disponibles en orden descendente
export const DENOMINATIONS = {
  bills: [200, 100, 50, 20, 10],
  coins: [5, 2, 1, 0.50, 0.20, 0.10],
  all: [200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10]
};

/**
 * Redondea un monto al múltiplo de 0.10 más cercano
 * Según norma peruana, se redondea hacia abajo si es .01-.04 y hacia arriba si es .06-.09
 * .05 se redondea hacia arriba por convención
 *
 * @param {number} amount - Monto a redondear
 * @returns {number} - Monto redondeado a 0.10
 */
export function roundToValidAmount(amount) {
  // Redondear a 1 decimal (múltiplo de 0.10)
  return Math.round(amount * 10) / 10;
}

/**
 * Calcula si es posible dar vuelto con las denominaciones disponibles
 * usando el algoritmo greedy (monedas/billetes más grandes primero)
 *
 * @param {number} change - Monto del vuelto a calcular
 * @returns {Object} - { possible: boolean, breakdown: Array, total: number }
 */
export function calculateChangeBreakdown(change) {
  // Redondear el cambio a 0.10
  const roundedChange = roundToValidAmount(change);

  if (roundedChange <= 0) {
    return { possible: true, breakdown: [], total: 0 };
  }

  const breakdown = [];
  let remaining = Math.round(roundedChange * 100); // Trabajar con centavos para evitar errores de punto flotante

  // Intentar usar cada denominación (de mayor a menor)
  for (const denom of DENOMINATIONS.all) {
    const denomInCents = Math.round(denom * 100);
    const count = Math.floor(remaining / denomInCents);

    if (count > 0) {
      breakdown.push({
        value: denom,
        count: count,
        total: (count * denom)
      });
      remaining -= count * denomInCents;
    }
  }

  // Verificar si quedó resto (no debería pasar si redondeamos correctamente)
  const possible = remaining === 0;
  const total = breakdown.reduce((sum, item) => sum + item.total, 0);

  return { possible, breakdown, total: roundToValidAmount(total) };
}

/**
 * Sugiere montos óptimos de pago para minimizar el vuelto
 *
 * Estrategias (priorizadas):
 * 1. Pago exacto (sin vuelto)
 * 2. Redondeos cercanos a enteros (ej: 17.90 → 18, 20)
 * 3. Billetes/monedas comunes cercanos al monto
 * 4. Combinaciones simples de 2 piezas
 *
 * @param {number} amountDue - Monto a pagar
 * @returns {Array} - Lista de montos sugeridos con descripción
 */
export function suggestOptimalPayments(amountDue) {
  const rounded = roundToValidAmount(amountDue);
  const suggestions = [];

  // 1. Pago exacto (siempre la mejor opción)
  suggestions.push({
    amount: rounded,
    change: 0,
    description: 'Pago exacto (sin vuelto)',
    priority: 1,
    optimal: true
  });

  // 2. 🔧 FIX: Sugerir redondeos a enteros cercanos PRIMERO
  // Para 12.90 → sugerir 13, 15, 20 (antes que 50, 100)
  const practicalSuggestions = [];

  // Redondeos a enteros cercanos (muy prácticos)
  const nearbyIntegers = [];
  const ceilingInt = Math.ceil(rounded); // 13 para 12.90

  // Sugerir el entero superior inmediato si está muy cerca (máximo +5)
  if (ceilingInt > rounded && ceilingInt - rounded <= 5) {
    nearbyIntegers.push({
      amount: ceilingInt,
      description: `S/ ${ceilingInt.toFixed(2)}`,
      priority: 2
    });
  }

  // Sugerir siguiente múltiplo de 5 si está cerca (máximo +10)
  const nextRound5 = Math.ceil(rounded / 5) * 5;
  if (nextRound5 > rounded && nextRound5 - rounded <= 10 && nextRound5 !== ceilingInt) {
    nearbyIntegers.push({
      amount: nextRound5,
      description: `S/ ${nextRound5.toFixed(2)}`,
      priority: 3
    });
  }

  nearbyIntegers.forEach((suggestion) => {
    const change = roundToValidAmount(suggestion.amount - rounded);
    const changeBreakdown = calculateChangeBreakdown(change);

    practicalSuggestions.push({
      amount: suggestion.amount,
      change: change,
      description: suggestion.description,
      priority: suggestion.priority,
      optimal: changeBreakdown.breakdown.length <= 2,
      changeBreakdown: changeBreakdown
    });
  });

  // Encontrar denominaciones únicas que cubran el monto (límite razonable)
  const maxSuggestion = Math.min(rounded * 3, 100); // No sugerir más de 100 o 3x el monto
  const singleDenoms = DENOMINATIONS.all.filter(d => d >= rounded && d <= maxSuggestion);

  // Agregar denominaciones únicas más cercanas (máximo 2)
  singleDenoms.slice(0, 2).forEach((denom, index) => {
    const change = roundToValidAmount(denom - rounded);
    const changeBreakdown = calculateChangeBreakdown(change);

    practicalSuggestions.push({
      amount: denom,
      change: change,
      description: `Con ${formatDenomination(denom)}`,
      priority: 4 + index, // Menor prioridad que redondeos a enteros
      optimal: changeBreakdown.breakdown.length <= 2,
      changeBreakdown: changeBreakdown
    });
  });

  // Agregar combinaciones simples de 2 denominaciones (solo si son prácticas)
  // Ej: 10+5=15 (solo si 15 no es un billete/moneda ni un redondeo ya sugerido)
  const practicalCombos = generatePracticalCombinations(rounded);
  practicalCombos.forEach((combo, index) => {
    const change = roundToValidAmount(combo.amount - rounded);
    const changeBreakdown = calculateChangeBreakdown(change);

    practicalSuggestions.push({
      amount: combo.amount,
      change: change,
      description: combo.description,
      priority: 6 + index, // Menor prioridad que billetes/monedas
      optimal: changeBreakdown.breakdown.length <= 2,
      changeBreakdown: changeBreakdown
    });
  });

  // Agregar todas las sugerencias prácticas a la lista principal
  suggestions.push(...practicalSuggestions);

  // Ordenar por prioridad y eliminar duplicados
  const unique = Array.from(
    new Map(suggestions.map(s => [s.amount, s])).values()
  );

  return unique
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6); // Mostrar máximo 6 sugerencias
}

/**
 * Genera combinaciones PRÁCTICAS de billetes/monedas
 * Solo sugiere combinaciones que:
 * 1. Usan denominaciones reales (no inventa billetes de 30, 25, etc.)
 * 2. Son útiles (no sugiere 20+5 si 20 ya cubre el monto)
 * 3. Están cerca del monto a pagar
 */
function generatePracticalCombinations(amountDue) {
  const combos = [];

  // Solo combinaciones útiles y comunes
  // Priorizar combinaciones que la gente realmente usa
  const usefulPairs = [
    [10, 5],   // 15 - muy común
    [10, 10],  // 20 - muy común (pero 20 ya existe como billete)
    [20, 10],  // 30 - NO útil si no existe billete de 30
    [20, 5],   // 25 - NO útil si 20 ya cubre
    [50, 10],  // 60 - útil
    [50, 20],  // 70 - útil
  ];

  usefulPairs.forEach(([denom1, denom2]) => {
    const total = denom1 + denom2;

    // Solo sugerir si:
    // 1. Cubre el monto
    // 2. No está demasiado lejos (máximo +20 del monto)
    // 3. No es una denominación que ya existe (ej: 10+10=20, pero ya existe billete de 20)
    if (total > amountDue && total <= amountDue + 20) {
      // Verificar que no sea una denominación existente
      const isDenomination = DENOMINATIONS.all.includes(total);

      // Solo agregar si NO es una denominación existente
      // (porque las denominaciones ya se sugieren en singleDenoms)
      if (!isDenomination) {
        combos.push({
          amount: total,
          description: `${formatDenomination(denom1)} + ${formatDenomination(denom2)}`
        });
      }
    }
  });

  return combos;
}

/**
 * Formatea una denominación para mostrar
 * Ejemplo: 0.50 -> "0.50", 20 -> "20"
 */
function formatDenomination(value) {
  if (value >= 10) {
    return `S/ ${value}`;
  } else if (value >= 1) {
    return `S/ ${value}`;
  } else {
    return `S/ ${value.toFixed(2)}`;
  }
}

/**
 * Valida si un monto de pago es aceptable
 * Considera:
 * - Que cubra el total
 * - Que el vuelto pueda darse con denominaciones disponibles
 * - Que esté redondeado correctamente
 */
export function validateCashPayment(cashReceived, amountDue) {
  const errors = [];
  const warnings = [];

  // Validar que sea un monto positivo
  if (cashReceived <= 0) {
    errors.push('El monto debe ser mayor a cero');
  }

  // Validar redondeo
  const rounded = roundToValidAmount(cashReceived);
  if (Math.abs(cashReceived - rounded) > 0.01) {
    warnings.push(`El monto se redondeará a S/ ${rounded.toFixed(2)}`);
  }

  // Calcular vuelto (puede ser negativo si es pago parcial)
  const change = roundToValidAmount(cashReceived - amountDue);

  // Solo validar denominaciones del vuelto si hay cambio positivo
  if (change > 0) {
    const changeBreakdown = calculateChangeBreakdown(change);

    if (!changeBreakdown.possible) {
      errors.push('No es posible dar vuelto exacto con las denominaciones disponibles');
    } else if (changeBreakdown.breakdown.length > 5) {
      warnings.push(`El vuelto requiere ${changeBreakdown.breakdown.length} billetes/monedas`);
    }
  }

  // Informar si es un pago parcial
  if (change < 0) {
    warnings.push(`Pago parcial: falta S/ ${Math.abs(change).toFixed(2)}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    change: change,
    changeBreakdown: change > 0 ? calculateChangeBreakdown(change) : null
  };
}

/**
 * Formatea el desglose del vuelto para mostrar
 */
export function formatChangeBreakdown(breakdown) {
  if (!breakdown || breakdown.length === 0) {
    return 'Sin vuelto';
  }

  return breakdown.map(item => {
    const denomination = item.value >= 1
      ? `S/ ${item.value}`
      : `S/ ${item.value.toFixed(2)}`;
    return `${item.count}x ${denomination}`;
  }).join(', ');
}

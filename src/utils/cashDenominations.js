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

  // 2. 🔧 FIX: Redondeos a enteros cercanos PRIMERO (antes de billetes grandes)
  // Para montos como 17.90, sugerir 18, 19, 20
  const nearbyIntegers = [];
  const ceilingInt = Math.ceil(rounded); // 18 para 17.90

  // Sugerir redondeo al entero superior inmediato
  if (ceilingInt > rounded && ceilingInt <= rounded + 5) {
    nearbyIntegers.push(ceilingInt);
  }

  // Sugerir siguiente entero "redondo" (múltiplo de 5)
  const nextRound5 = Math.ceil(rounded / 5) * 5;
  if (nextRound5 > rounded && nextRound5 <= rounded + 10 && !nearbyIntegers.includes(nextRound5)) {
    nearbyIntegers.push(nextRound5);
  }

  // Sugerir siguiente múltiplo de 10
  const nextRound10 = Math.ceil(rounded / 10) * 10;
  if (nextRound10 > rounded && nextRound10 <= rounded + 15 && !nearbyIntegers.includes(nextRound10)) {
    nearbyIntegers.push(nextRound10);
  }

  nearbyIntegers.forEach((amount, index) => {
    const change = roundToValidAmount(amount - rounded);
    const changeBreakdown = calculateChangeBreakdown(change);

    suggestions.push({
      amount: amount,
      change: change,
      description: `S/ ${amount.toFixed(2)}`,
      priority: 2 + index, // Alta prioridad
      optimal: changeBreakdown.breakdown.length <= 2,
      changeBreakdown: changeBreakdown
    });
  });

  // 3. Billetes/monedas comunes que cubran el monto (solo los más cercanos)
  // Filtrar solo denominaciones hasta 2x el monto para evitar sugerencias muy altas
  const maxSuggestion = rounded * 2;
  const coveringDenoms = DENOMINATIONS.all.filter(d => d >= rounded && d <= maxSuggestion);

  if (coveringDenoms.length > 0) {
    // Solo las 2 denominaciones más pequeñas que cubran
    coveringDenoms.slice(0, 2).forEach((denom, index) => {
      const change = roundToValidAmount(denom - rounded);
      const changeBreakdown = calculateChangeBreakdown(change);

      suggestions.push({
        amount: denom,
        change: change,
        description: `Con ${formatDenomination(denom)}`,
        priority: 6 + index, // Menor prioridad que redondeos
        optimal: changeBreakdown.breakdown.length <= 2,
        changeBreakdown: changeBreakdown
      });
    });
  }

  // 4. Combinaciones de 2 billetes/monedas comunes (solo cercanas)
  const commonCombos = generateCommonCombinations(rounded);
  commonCombos.slice(0, 2).forEach((combo, index) => {
    const change = roundToValidAmount(combo.amount - rounded);
    const changeBreakdown = calculateChangeBreakdown(change);

    suggestions.push({
      amount: combo.amount,
      change: change,
      description: combo.description,
      priority: 8 + index,
      optimal: changeBreakdown.breakdown.length <= 1,
      changeBreakdown: changeBreakdown
    });
  });

  // Ordenar por prioridad y eliminar duplicados
  const unique = Array.from(
    new Map(suggestions.map(s => [s.amount, s])).values()
  );

  return unique
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6); // Mostrar máximo 6 sugerencias
}

/**
 * Genera combinaciones comunes de billetes/monedas
 * Por ejemplo: 20+10, 50+10, 100+20, etc.
 */
function generateCommonCombinations(amountDue) {
  const combos = [];
  const commonPairs = [
    [20, 10], [20, 5], [20, 2], [20, 1],
    [50, 10], [50, 5], [50, 2],
    [100, 20], [100, 10], [100, 5],
    [10, 5], [10, 2], [10, 1],
    [5, 2], [5, 1]
  ];

  commonPairs.forEach(([denom1, denom2]) => {
    const total = denom1 + denom2;
    if (total > amountDue && total <= amountDue + 30) {
      combos.push({
        amount: total,
        description: `Con ${formatDenomination(denom1)} + ${formatDenomination(denom2)}`
      });
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

import apiClient from './axios';

// Cliente headless de Cap.js (proof-of-work CAPTCHA) contra los endpoints
// /cap/* del API. Resuelve el reto de forma invisible y devuelve un token de
// verificación de un solo uso que el backend valida con CapController::isValidToken.
//
// Protocolo (legacy Cap.js que implementa CapController):
//  - POST /cap/challenge → { challenge: [[salt, target], ...], token, expires }
//  - PoW: encontrar nonce tal que sha256hex(salt + nonce) empiece con `target`
//  - POST /cap/redeem { token, solutions:[nonce,...] } → { success, token }

const sha256Hex = async (str) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

const solveChallenge = async ([salt, target]) => {
  // Límite de seguridad: target de 2 ceros hex ≈ 256 intentos promedio.
  for (let nonce = 0; nonce < 5_000_000; nonce++) {
    const hash = await sha256Hex(salt + String(nonce));
    if (hash.startsWith(target)) return nonce;
  }
  throw new Error('No se pudo resolver el desafío de verificación');
};

/**
 * Resuelve el CAPTCHA y devuelve el token de verificación (string).
 * Lanza si falla la red o el reto.
 */
export const solveCaptcha = async () => {
  const challengeRes = await apiClient.post('/cap/challenge');
  const { challenge, token } = challengeRes.data || {};
  if (!Array.isArray(challenge) || !token) {
    throw new Error('Respuesta de challenge inválida');
  }

  const solutions = [];
  for (const ch of challenge) {
    solutions.push(await solveChallenge(ch));
  }

  const redeemRes = await apiClient.post('/cap/redeem', { token, solutions });
  const verificationToken = redeemRes.data?.token;
  if (!redeemRes.data?.success || !verificationToken) {
    throw new Error('No se pudo verificar el desafío');
  }
  return verificationToken;
};

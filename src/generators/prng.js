/**
 * Seeded pseudo-random number generator — Mulberry32.
 *
 * Fast, simple, good statistical properties, and produces identical
 * sequences for identical seeds. Everything random in Oneiro flows
 * through one of these so characters are reproducible from their seed.
 *
 * Usage:
 *   import { makeRng, seedFromString } from './prng.js';
 *   const rng = makeRng(seedFromString('my-world'));
 *   rng(); // → number in [0, 1)
 */

/**
 * Create a seeded RNG from a 32-bit integer seed.
 * Returns a function that yields the next value in [0, 1) each call.
 */
export function makeRng(seed) {
  let s = seed >>> 0; // ensure unsigned 32-bit
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string to a 32-bit unsigned integer seed.
 * Deterministic: same string always produces the same seed.
 * Uses a simple djb2-style hash.
 */
export function seedFromString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Generate a random alphanumeric seed string (for display / sharing).
 * Uses the browser's crypto API when available, falls back to Math.random.
 */
export function randomSeedString(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result  = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint8Array(length);
    crypto.getRandomValues(buf);
    for (const byte of buf) {
      result += chars[byte % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}

/**
 * Advance an RNG by N steps (useful for giving each field its own
 * reproducible sub-sequence without creating N separate RNGs).
 */
export function advanceRng(rng, steps) {
  for (let i = 0; i < steps; i++) rng();
}

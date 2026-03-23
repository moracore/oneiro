/**
 * Syllable-based name generator.
 *
 * Names are built as: start + middle*(n-2) + end
 *
 * Each pool (start, middle, end) contains phonetic segments tuned per race.
 * Gender controls which end (and sometimes start) pool is used.
 *
 * Config shape (see phonetics JSONs):
 * {
 *   count: { values: [1,2,3], weights: [0.2,0.6,0.2] },
 *   start:  { male: [], female: [], unisex: [] },  // or flat [] for all-unisex
 *   middle: [],
 *   end:    { male: [], female: [], unisex: [] },  // or flat []
 * }
 *
 * Either `start`/`end` can be a flat array (shared across genders) or an
 * object with male/female/unisex keys.
 */

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Weighted random pick. If no weights provided, uniform distribution.
 * @param {any[]}    items
 * @param {number[]} [weights]
 * @param {function} rng      - Returns [0,1)
 */
export function weightedPick(items, weights, rng) {
  if (!items || items.length === 0) return '';

  if (!weights || weights.length === 0) {
    return items[Math.floor(rng() * items.length)];
  }

  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1]; // float edge case
}

/**
 * Resolve a pool that may be either a flat array or { male, female, unisex }.
 * Falls back: exact gender → unisex → merged male+female
 */
function resolvePool(pool, gender) {
  if (Array.isArray(pool)) return pool;
  return pool[gender] || pool.unisex || [
    ...(pool.male   || []),
    ...(pool.female || []),
  ];
}

// ---------------------------------------------------------------------------
// Core builder
// ---------------------------------------------------------------------------

/**
 * Generate a single name from a phonetics config.
 *
 * @param {object}   phonetics - Race phonetics config.
 * @param {string}   gender    - 'male' | 'female' | 'unisex'
 * @param {function} rng       - Seeded random returning [0,1)
 * @returns {string}           - Capitalised name string
 */
export function buildName(phonetics, gender, rng) {
  const { count, start, middle, end } = phonetics;

  // 1. Pick syllable count
  const n = weightedPick(count.values, count.weights, rng);

  const startPool  = resolvePool(start, gender);
  const middlePool = middle || [];
  const endPool    = resolvePool(end, gender);

  // 2. Build the name
  let name = '';

  if (n === 1) {
    // Short names: just a start segment, optional end
    name = weightedPick(startPool, null, rng);
    if (endPool.length > 0 && rng() > 0.3) {
      name += weightedPick(endPool, null, rng);
    }
  } else {
    // First segment
    name += weightedPick(startPool, null, rng);

    // Middle segments (n - 2 of them, only if n > 2)
    for (let i = 0; i < n - 2; i++) {
      if (middlePool.length > 0) {
        name += weightedPick(middlePool, null, rng);
      }
    }

    // Final segment
    if (endPool.length > 0) {
      name += weightedPick(endPool, null, rng);
    }
  }

  // 3. Capitalise and return
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Generate multiple names. Retries to avoid duplicates.
 */
export function buildNames(phonetics, gender, rng, count = 1) {
  const seen   = new Set();
  const result = [];
  let   tries  = 0;

  while (result.length < count && tries < count * 40) {
    tries++;
    const name = buildName(phonetics, gender, rng);
    if (name && name.length >= 2 && !seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }

  return result;
}

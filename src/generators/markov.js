/**
 * Markov chain name generator.
 *
 * Builds a character-level transition table from a corpus of names,
 * then uses it to generate new names that sound like the training set.
 *
 * Order 2 (default) means: given the previous 2 characters, pick the next one.
 * Works well for name corpora of 15–50 names. Order 3 with small corpora
 * tends to reproduce training names verbatim — avoid it unless the corpus
 * is 100+ names.
 */

const START = '^';
const END   = '$';

/**
 * Train a Markov chain on an array of names.
 *
 * @param {string[]} names   - Training corpus.
 * @param {number}   order   - Context window size (default 2).
 * @returns {object}         - Transition table: { context: { nextChar: probability } }
 */
export function buildChain(names, order = 2) {
  if (!names || names.length === 0) return {};

  const counts = {};

  for (const raw of names) {
    const name = raw.toLowerCase().trim();
    if (!name) continue;

    // Pad the start with `order` start markers, append end marker
    const chars = [
      ...Array(order).fill(START),
      ...name.split(''),
      END,
    ];

    for (let i = 0; i < chars.length - order; i++) {
      const context = chars.slice(i, i + order).join('');
      const next    = chars[i + order];

      if (!counts[context]) counts[context] = {};
      counts[context][next] = (counts[context][next] || 0) + 1;
    }
  }

  // Normalise counts → probabilities
  const chain = {};
  for (const context of Object.keys(counts)) {
    const total = Object.values(counts[context]).reduce((a, b) => a + b, 0);
    chain[context] = {};
    for (const [ch, count] of Object.entries(counts[context])) {
      chain[context][ch] = count / total;
    }
  }

  return chain;
}

/**
 * Generate a single name from a trained chain.
 *
 * @param {object}   chain      - Output of buildChain().
 * @param {function} rng        - Seeded random function returning [0, 1).
 * @param {number}   order      - Must match the order used in buildChain().
 * @param {number}   minLength  - Minimum character count for a valid result.
 * @param {number}   maxLength  - Hard cap on generated length.
 * @param {number}   maxRetries - Give up and return null after this many failures.
 * @returns {string|null}       - Capitalised name, or null if generation failed.
 */
export function generateName(
  chain,
  rng,
  order     = 2,
  minLength = 3,
  maxLength = 12,
  maxRetries = 200
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let context = Array(order).fill(START).join('');
    let name    = '';

    for (let step = 0; step < maxLength + order; step++) {
      const options = chain[context];
      if (!options) break;

      // Weighted random pick over the probability distribution
      const roll = rng();
      let cumulative = 0;
      let next = null;

      for (const [ch, prob] of Object.entries(options)) {
        cumulative += prob;
        if (roll < cumulative) {
          next = ch;
          break;
        }
      }

      // Floating point edge: if nothing was picked, take the last key
      if (!next) {
        next = Object.keys(options).at(-1);
      }

      if (next === END) break;

      name   += next;
      context = (context + next).slice(-order);
    }

    if (name.length >= minLength) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  return null; // all attempts failed
}

/**
 * Generate multiple unique names from a trained chain.
 *
 * @param {object}   chain    - Output of buildChain().
 * @param {function} rng      - Seeded random function.
 * @param {number}   count    - How many names to generate.
 * @param {object}   opts     - Options forwarded to generateName().
 * @returns {string[]}        - Array of generated names (may be shorter than
 *                              `count` if the chain is very constrained).
 */
export function generateNames(chain, rng, count = 1, opts = {}) {
  const { order, minLength, maxLength, maxRetries } = opts;
  const seen   = new Set();
  const result = [];

  // Hard cap on total attempts to avoid infinite loops
  const totalRetries = count * 50;
  let tries = 0;

  while (result.length < count && tries < totalRetries) {
    tries++;
    const name = generateName(chain, rng, order, minLength, maxLength, maxRetries);
    if (name && !seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }

  return result;
}

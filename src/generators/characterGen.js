/**
 * Character generator — Mode 1 of Oneiro.
 *
 * Produces a complete character object from a seed string. Every field is
 * deterministic: same seed → same character, always.
 *
 * Each field draws from a dedicated RNG offset so locking one field and
 * rerolling another doesn't cascade — the rerolled field uses its own
 * sub-sequence.
 *
 * Output shape:
 * {
 *   seed:        string,
 *   race:        string,
 *   gender:      string,
 *   name:        string,
 *   alignment:   { id, law, moral, label, short, flavour },
 *   appearance:  { build, feature, distinctive },
 *   personality: { strength, flaw },
 *   stats: {
 *     STR: { score, modifier },
 *     DEX: { score, modifier },
 *     CON: { score, modifier },
 *     INT: { score, modifier },
 *     WIS: { score, modifier },
 *     CHA: { score, modifier },
 *   }
 * }
 */

import { makeRng, seedFromString, randomSeedString } from './prng.js';
import { generateCharacterName, RACES } from './nameGenerator.js';

// --- Data (bundler / Node with --experimental-json-modules handles these) ---
import alignmentData   from '../data/alignments.json';
import appearanceData  from '../data/appearance.json';
import personalityData from '../data/personality.json';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export { RACES };
export const GENDERS = ['male', 'female', 'unisex'];
export const STAT_NAMES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

/**
 * RNG "slots" — each field advances the master RNG by a fixed offset before
 * drawing, so they're independent of each other and reordering draws doesn't
 * break reproducibility.
 */
const SLOTS = {
  RACE:        0,
  GENDER:      10,
  NAME:        20,
  ALIGNMENT:   40,
  BUILD:       60,
  FEATURE:     70,
  DISTINCTIVE: 80,
  STRENGTH:    100,
  FLAW:        110,
  STATS:       120,   // uses 6 × 4 = 24 draws
};

/**
 * Resolve a locked value using dot-notation keys.
 * e.g. get(locked, 'appearance.build') checks locked['appearance.build'] first,
 * then locked['appearance']?.build as a fallback.
 */
function getLocked(locked, key) {
  if (key in locked) return locked[key];
  const dot = key.indexOf('.');
  if (dot !== -1) {
    const parent = key.slice(0, dot);
    const child  = key.slice(dot + 1);
    if (parent in locked && locked[parent] != null) return locked[parent][child];
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Advance rng by N draws and return the Nth value. */
function rngAt(rng, offset) {
  for (let i = 0; i < offset; i++) rng();
  return rng;
}

/** Weighted pick from an array given a parallel weights array. */
function weightedPick(items, weights, rng) {
  const total = weights.reduce((a, b) => a + b, 0);
  let   roll  = rng() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Uniform pick from an array. */
function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

// ---------------------------------------------------------------------------
// Field generators
// ---------------------------------------------------------------------------

function generateRace(rng) {
  // All races equally likely — bias can be added later via weights
  return pick(RACES, rng);
}

function generateGender(rng) {
  return pick(GENDERS, rng);
}

function generateAlignment(rng) {
  const { alignments, weights } = alignmentData;
  const w = alignments.map(a => weights[a.id]);
  return weightedPick(alignments, w, rng);
}

function generateBuild(race, rng) {
  const { build } = appearanceData;
  const pool = build.race[race] || build.shared;
  return capitalise(pick(pool, rng));
}

function generateFeature(rng) {
  const pool = appearanceData.feature.filter(f => !f.startsWith('_'));
  return capitalise(pick(pool, rng));
}

function generateDistinctive(race, rng) {
  const { distinctive } = appearanceData;
  const pool = [...distinctive.shared, ...(distinctive.race[race] || [])];
  return capitalise(pick(pool, rng));
}

function generateStrength(rng) {
  return capitalise(pick(personalityData.strength, rng));
}

function generateFlaw(rng) {
  return capitalise(pick(personalityData.flaw, rng));
}

/**
 * Roll tiers — each defines (dice, keep) where `keep` is how many highest dice to sum.
 * Each stat draw uses `dice` RNG calls regardless of tier, keeping SLOTS spacing stable.
 * We always consume 6 draws (the max) per stat so STATS slot math never drifts.
 */
/**
 * Roll tiers — (dice, keep, bonus) where we roll `dice` d6, keep the `keep`
 * highest, then add `bonus`. MAX_DICE RNG draws are always consumed per stat
 * so slot offsets stay stable across tier changes.
 *
 * Expected avg per stat → expected 6-stat total:
 *   very-weak:  2d6+3     → 10.0  → ~60
 *   weak:       3d6       → 10.5  → ~63  (target 64)
 *   mid:        4d6 drop1 → 12.24 → ~74  (target 72)
 *   strong:     3d6+2     → 12.5  → ~75  (target 76)
 *   very-strong: 5d6 drop2 → 13.43 → ~81 (target 80)
 */
export const ROLL_MODES = [
  { id: 'very-weak',   label: 'Very Weak',   dice: 2, keep: 2, bonus: 3 },
  { id: 'weak',        label: 'Weak',         dice: 3, keep: 3, bonus: 0 },
  { id: 'mid',         label: 'Mid',          dice: 4, keep: 3, bonus: 0 },
  { id: 'strong',      label: 'Strong',       dice: 3, keep: 3, bonus: 2 },
  { id: 'very-strong', label: 'Very Strong',  dice: 5, keep: 3, bonus: 0 },
];

const ROLL_MODE_MAP = Object.fromEntries(ROLL_MODES.map(m => [m.id, m]));
const MAX_DICE = 6; // always consume this many draws per stat to keep slot offsets stable

function rollStat(rng, mode = 'mid') {
  const { dice, keep, bonus } = ROLL_MODE_MAP[mode] ?? ROLL_MODE_MAP.mid;
  const rolls = [];
  for (let i = 0; i < MAX_DICE; i++) {
    const v = Math.floor(rng() * 6) + 1;
    if (i < dice) rolls.push(v);
  }
  rolls.sort((a, b) => b - a); // descending — keep the highest
  return rolls.slice(0, keep).reduce((a, b) => a + b, 0) + bonus;
}

function statModifier(score) {
  return Math.floor((score - 10) / 2);
}

function generateStats(rng, mode = 'mid') {
  const stats = {};
  for (const name of STAT_NAMES) {
    const score = rollStat(rng, mode);
    stats[name] = { score, modifier: statModifier(score) };
  }
  return stats;
}

function capitalise(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a complete character from a seed string.
 *
 * @param {string}  seedStr  - Any string. Same string → same character.
 * @param {object}  [locked] - Optional map of locked field values.
 *                             If a field key is present, that value is used
 *                             instead of generating a new one.
 *                             Keys: race, gender, name, alignment, appearance,
 *                                   personality, stats
 * @returns {object} Character object
 */
export function generateCharacter(seedStr, locked = {}, rollMode = 'mid') {
  const seed = seedFromString(seedStr);

  // Each field gets a fresh RNG starting from the same seed but advanced
  // by a fixed offset — changes to one field don't affect others.
  const makeFieldRng = (offset) => {
    const rng = makeRng(seed);
    for (let i = 0; i < offset; i++) rng();
    return rng;
  };

  const race    = getLocked(locked, 'race')    ?? generateRace(makeFieldRng(SLOTS.RACE));
  const gender  = getLocked(locked, 'gender')  ?? generateGender(makeFieldRng(SLOTS.GENDER));
  const name    = getLocked(locked, 'name')    ?? generateCharacterName(race, gender, makeFieldRng(SLOTS.NAME));
  const alignment = getLocked(locked, 'alignment') ?? generateAlignment(makeFieldRng(SLOTS.ALIGNMENT));

  const appearance = {
    build:       getLocked(locked, 'appearance.build')       ?? generateBuild(race, makeFieldRng(SLOTS.BUILD)),
    feature:     getLocked(locked, 'appearance.feature')     ?? generateFeature(makeFieldRng(SLOTS.FEATURE)),
    distinctive: getLocked(locked, 'appearance.distinctive') ?? generateDistinctive(race, makeFieldRng(SLOTS.DISTINCTIVE)),
  };

  const personality = {
    strength: getLocked(locked, 'personality.strength') ?? generateStrength(makeFieldRng(SLOTS.STRENGTH)),
    flaw:     getLocked(locked, 'personality.flaw')     ?? generateFlaw(makeFieldRng(SLOTS.FLAW)),
  };

  const stats = getLocked(locked, 'stats') ?? generateStats(makeFieldRng(SLOTS.STATS), rollMode);

  return {
    seed: seedStr,
    race,
    gender,
    name,
    alignment,
    appearance,
    personality,
    stats,
  };
}

/**
 * Generate a single field value in isolation, using a fresh random seed.
 * Used for per-field reroll buttons — returns just the new value, not a
 * full character object.
 *
 * @param {string} field     - Dot-notation field key, e.g. 'appearance.build'
 * @param {object} context   - Current character (race + gender needed for some fields)
 * @returns {*}              - New value for that field
 */
export function generateFieldValue(field, context = {}) {
  const seed     = seedFromString(randomSeedString());
  const rng      = makeRng(seed);
  const race     = context.race     || 'human';
  const gender   = context.gender   || 'unisex';
  const rollMode = context.rollMode || 'mid';

  switch (field) {
    case 'name':                return generateCharacterName(race, gender, rng);
    case 'alignment':           return generateAlignment(rng);
    case 'appearance.build':    return generateBuild(race, rng);
    case 'appearance.feature':  return generateFeature(rng);
    case 'appearance.distinctive': return generateDistinctive(race, rng);
    case 'personality.strength': return generateStrength(rng);
    case 'personality.flaw':    return generateFlaw(rng);
    case 'stats':               return generateStats(rng, rollMode);
    default:                    return null;
  }
}

export { randomSeedString };

/**
 * Re-generate a character with specific fields locked.
 * Pass the existing character and the new seed to roll unlocked fields.
 *
 * @param {object} existing  - Previous character object
 * @param {string} newSeed   - New seed (e.g., seedStr + '-reroll-1')
 * @param {string[]} lockFields - Array of field keys to preserve
 * @returns {object} New character with locked fields preserved
 */
export function rerollCharacter(existing, newSeed, lockFields = []) {
  const locked = {};
  for (const field of lockFields) {
    if (existing[field] !== undefined) {
      locked[field] = existing[field];
    }
  }
  return generateCharacter(newSeed, locked);
}

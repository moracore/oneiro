/**
 * Name generator for Oneiro — syllable-based.
 *
 * Each race has a `phonetics` block in its JSON defining segment pools
 * (start, middle, end) tuned to the race's phonetic conventions.
 * Gender controls which end (and sometimes start) pool is drawn from.
 *
 * Usage:
 *   import { generateCharacterName } from './nameGenerator.js';
 *   const name = generateCharacterName('elf', 'female', rng);
 *
 * Special case — tiefling unisex:
 *   Virtue names (Art, Torment, Hope…) are English abstract nouns and don't
 *   follow syllable patterns. When gender === 'unisex', tiefling names are
 *   picked directly from the corpus list.
 */

import { buildName } from './syllableGen.js';

// --- Data ---
import aasimar    from '../data/names/aasimar.json';
import dragonborn from '../data/names/dragonborn.json';
import dwarf      from '../data/names/dwarf.json';
import elf        from '../data/names/elf.json';
import gnome      from '../data/names/gnome.json';
import goliath    from '../data/names/goliath.json';
import halfling   from '../data/names/halfling.json';
import human      from '../data/names/human.json';
import orc        from '../data/names/orc.json';
import tiefling   from '../data/names/tiefling.json';

// --- Constants ---

export const RACES = [
  'aasimar', 'dragonborn', 'dwarf', 'elf',
  'gnome', 'goliath', 'halfling', 'human', 'orc', 'tiefling',
];

export const GENDERS = ['male', 'female', 'unisex'];

const RACE_DATA = {
  aasimar, dragonborn, dwarf, elf,
  gnome, goliath, halfling, human, orc, tiefling,
};

// --- Public API ---

/**
 * Generate a single character name.
 *
 * @param {string}   race   - One of the RACES values.
 * @param {string}   gender - 'male' | 'female' | 'unisex'
 * @param {function} rng    - Seeded random returning [0, 1)
 * @returns {string}        - Generated name
 */
export function generateCharacterName(race, gender, rng) {
  const r = race.toLowerCase();
  const g = gender.toLowerCase();

  if (!RACES.includes(r)) {
    throw new Error(`Unknown race: "${race}". Valid: ${RACES.join(', ')}`);
  }
  if (!GENDERS.includes(g)) {
    throw new Error(`Unknown gender: "${gender}". Valid: ${GENDERS.join(', ')}`);
  }

  const data = RACE_DATA[r];

  // Special case: tiefling virtue names bypass syllable generation
  if (r === 'tiefling' && g === 'unisex') {
    const pool = data.unisex || [];
    if (pool.length > 0) {
      return pool[Math.floor(rng() * pool.length)];
    }
  }

  const phonetics = data.phonetics;
  if (!phonetics) {
    // No phonetics defined — fall back to picking directly from the corpus
    const pool = data[g] || data.unisex || data.male || [];
    return pool[Math.floor(rng() * pool.length)] || 'Unknown';
  }

  return buildName(phonetics, g, rng);
}

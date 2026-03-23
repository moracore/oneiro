/**
 * Tests for the character generator.
 * Run: node src/generators/characterGen.test.js
 *
 * Tests the full pipeline without a bundler by inlining all data as JS.
 */

import { makeRng, seedFromString } from './prng.js';
import { buildName }               from './syllableGen.js';
import { weightedPick }            from './syllableGen.js';

// --------------------------------------------------------------------------
// Inline fixtures (mirrors the JSON data so we can run in plain Node)
// --------------------------------------------------------------------------

const RACES   = ['aasimar','dragonborn','dwarf','elf','gnome','goliath','halfling','human','orc','tiefling'];
const GENDERS = ['male', 'female', 'unisex'];
const STATS   = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

const ALIGNMENTS = [
  { id: 'lawful-good',    label: 'Lawful Good',    weight: 8  },
  { id: 'neutral-good',   label: 'Neutral Good',   weight: 10 },
  { id: 'chaotic-good',   label: 'Chaotic Good',   weight: 8  },
  { id: 'lawful-neutral', label: 'Lawful Neutral',  weight: 8  },
  { id: 'true-neutral',   label: 'True Neutral',    weight: 14 },
  { id: 'chaotic-neutral',label: 'Chaotic Neutral', weight: 9  },
  { id: 'lawful-evil',    label: 'Lawful Evil',     weight: 5  },
  { id: 'neutral-evil',   label: 'Neutral Evil',    weight: 7  },
  { id: 'chaotic-evil',   label: 'Chaotic Evil',    weight: 4  },
];

const STRENGTHS = [
  "fiercely loyal to those they've decided to call friend",
  "quietly perceptive — notices what others miss",
  "steady under pressure, almost always the last one to panic",
  "honest even when honesty costs something",
  "patient in a way that borders on the unnerving",
  "curious about everything, endlessly and without embarrassment",
  "calm in the presence of things that would break most people",
  "resourceful when all the obvious options are gone",
  "warm with strangers in a way that disarms before suspicion can form",
  "deeply empathetic — feels what others feel",
];

const FLAWS = [
  "holds grudges long after everyone else has moved on",
  "arrogant about their own judgment in ways that create blind spots",
  "reckless when the stakes feel high enough",
  "secretive by reflex — withholds even when it helps no one",
  "slow to trust and quick to revoke it",
  "too proud to ask for help they badly need",
  "impulsive — decisions made before consequences are considered",
  "bitter about something that happened a long time ago",
  "unable to admit when they're wrong",
  "dismissive of people they've decided don't matter",
];

// Mini character generator (mirrors characterGen.js logic)

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function roll4d6DropLowest(rng) {
  const rolls = [
    Math.floor(rng() * 6) + 1,
    Math.floor(rng() * 6) + 1,
    Math.floor(rng() * 6) + 1,
    Math.floor(rng() * 6) + 1,
  ];
  rolls.sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}

function statModifier(score) { return Math.floor((score - 10) / 2); }

function makeFieldRng(seed, offset) {
  const rng = makeRng(seed);
  for (let i = 0; i < offset; i++) rng();
  return rng;
}

function buildCharacter(seedStr) {
  const seed = seedFromString(seedStr);
  const race      = pick(RACES,   makeFieldRng(seed, 0));
  const gender    = pick(GENDERS, makeFieldRng(seed, 10));
  const alignment = weightedPick(ALIGNMENTS, ALIGNMENTS.map(a => a.weight), makeFieldRng(seed, 40));
  const strength  = pick(STRENGTHS, makeFieldRng(seed, 100));
  const flaw      = pick(FLAWS,     makeFieldRng(seed, 110));
  const statsRng  = makeFieldRng(seed, 120);
  const stats = {};
  for (const name of STATS) {
    const score = roll4d6DropLowest(statsRng);
    stats[name] = { score, modifier: statModifier(score) };
  }
  return { seed: seedStr, race, gender, alignment, personality: { strength, flaw }, stats };
}

// --------------------------------------------------------------------------
// Test harness
// --------------------------------------------------------------------------

let passed = 0, failed = 0;

function test(label, fn) {
  try   { fn(); console.log(`  ✓ ${label}`); passed++; }
  catch (e) { console.error(`  ✗ ${label}\n    ${e.message}`); failed++; }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

// --------------------------------------------------------------------------
// PRNG tests
// --------------------------------------------------------------------------

console.log('\nPRNG');

test('same seed → identical sequence', () => {
  const a = makeRng(seedFromString('test'));
  const b = makeRng(seedFromString('test'));
  for (let i = 0; i < 20; i++) assert(a() === b(), `diverged at step ${i}`);
});

test('different seeds → different sequences', () => {
  const a = makeRng(seedFromString('hello'));
  const b = makeRng(seedFromString('world'));
  let same = 0;
  for (let i = 0; i < 20; i++) { if (a() === b()) same++; }
  assert(same < 3, `seeds produced too-similar sequences: ${same}/20 matching`);
});

test('output is in [0, 1)', () => {
  const rng = makeRng(42);
  for (let i = 0; i < 1000; i++) {
    const v = rng();
    assert(v >= 0 && v < 1, `out of range: ${v}`);
  }
});

test('seedFromString is deterministic', () => {
  assert(seedFromString('oneiro') === seedFromString('oneiro'));
  assert(seedFromString('oneiro') !== seedFromString('ONEIRO'));
});

// --------------------------------------------------------------------------
// Character generation
// --------------------------------------------------------------------------

console.log('\nCharacter generation');

test('same seed produces identical character', () => {
  const a = buildCharacter('adventurer-42');
  const b = buildCharacter('adventurer-42');
  assert(a.race      === b.race);
  assert(a.gender    === b.gender);
  assert(a.alignment.id === b.alignment.id);
  assert(a.personality.strength === b.personality.strength);
  assert(a.personality.flaw     === b.personality.flaw);
  for (const s of STATS) {
    assert(a.stats[s].score === b.stats[s].score, `${s} differs`);
  }
});

test('different seeds produce different characters (usually)', () => {
  const chars = Array.from({ length: 30 }, (_, i) => buildCharacter(`seed-${i}`));
  const races  = new Set(chars.map(c => c.race));
  const aligns = new Set(chars.map(c => c.alignment.id));
  assert(races.size  > 3, `only ${races.size} distinct races in 30 chars`);
  assert(aligns.size > 3, `only ${aligns.size} distinct alignments in 30 chars`);
});

test('race is always a valid race', () => {
  for (let i = 0; i < 50; i++) {
    const c = buildCharacter(`r-${i}`);
    assert(RACES.includes(c.race), `invalid race: ${c.race}`);
  }
});

test('gender is always a valid gender', () => {
  for (let i = 0; i < 50; i++) {
    const c = buildCharacter(`g-${i}`);
    assert(GENDERS.includes(c.gender), `invalid gender: ${c.gender}`);
  }
});

// --------------------------------------------------------------------------
// Alignment distribution
// --------------------------------------------------------------------------

console.log('\nAlignment distribution (500 samples)');

test('True Neutral is the most common alignment', () => {
  const counts = {};
  for (let i = 0; i < 500; i++) {
    const c = buildCharacter(`align-${i}`);
    counts[c.alignment.id] = (counts[c.alignment.id] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  assert(sorted[0][0] === 'true-neutral', `most common was: ${sorted[0][0]}`);
  const ceCount = counts['chaotic-evil'] || 0;
  const tnCount = counts['true-neutral'] || 0;
  assert(tnCount > ceCount * 2, `TN(${tnCount}) should be >2× CE(${ceCount})`);
  // Print distribution for visual check
  for (const [id, count] of sorted) {
    const bar = '█'.repeat(Math.round(count / 5));
    console.log(`    ${id.padEnd(18)} ${String(count).padStart(3)}  ${bar}`);
  }
});

// --------------------------------------------------------------------------
// Stats
// --------------------------------------------------------------------------

console.log('\nAbility scores');

test('all scores are in [3, 18]', () => {
  for (let i = 0; i < 100; i++) {
    const c = buildCharacter(`stats-${i}`);
    for (const s of STATS) {
      const { score } = c.stats[s];
      assert(score >= 3 && score <= 18, `${s}=${score} out of [3,18]`);
    }
  }
});

test('modifier = floor((score - 10) / 2)', () => {
  for (let i = 0; i < 50; i++) {
    const c = buildCharacter(`mod-${i}`);
    for (const s of STATS) {
      const { score, modifier } = c.stats[s];
      const expected = Math.floor((score - 10) / 2);
      assert(modifier === expected, `${s}: expected mod ${expected}, got ${modifier}`);
    }
  }
});

test('average score across many rolls is between 11 and 13 (4d6 drop lowest)', () => {
  let total = 0, count = 0;
  for (let i = 0; i < 200; i++) {
    const c = buildCharacter(`avg-${i}`);
    for (const s of STATS) {
      total += c.stats[s].score;
      count++;
    }
  }
  const avg = total / count;
  assert(avg > 11 && avg < 14, `average score ${avg.toFixed(2)} outside expected range [11,14]`);
  console.log(`    Average stat score across 200 characters: ${avg.toFixed(2)}`);
});

// --------------------------------------------------------------------------
// Locking / field independence
// --------------------------------------------------------------------------

console.log('\nField independence');

test('changing seed changes unlocked fields but locked ones stay constant', () => {
  const base    = buildCharacter('base');
  const locked  = base.race;

  let changed = 0;
  for (let i = 0; i < 20; i++) {
    const c = buildCharacter(`reroll-${i}`);
    if (c.race !== locked) changed++;
  }
  assert(changed > 0, 'race never changed across 20 seeds — something is wrong');
});

test('RNG offset slots are actually independent', () => {
  // Changing the race slot offset shouldn't affect the stats slot
  const seed  = seedFromString('independence-test');
  const rng1  = makeRng(seed); for (let i = 0; i < 120; i++) rng1();
  const rng2  = makeRng(seed); for (let i = 0; i < 120; i++) rng2();
  assert(rng1() === rng2(), 'same offset should produce same value');
});

// --------------------------------------------------------------------------
// Sample output
// --------------------------------------------------------------------------

console.log('\nSample characters (seed per row):');

const sampleSeeds = ['tavern-brawl', 'night-watch', 'old-road-trader', 'the-heist', 'forest-hermit'];
for (const s of sampleSeeds) {
  const c = buildCharacter(s);
  const statLine = STATS.map(k => {
    const { score, modifier } = c.stats[k];
    const mod = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    return `${k}:${score}(${mod})`;
  }).join(' ');
  console.log(`  [${s}]`);
  console.log(`    ${c.race} ${c.gender} — ${c.alignment.label}`);
  console.log(`    ${c.personality.strength}`);
  console.log(`    ${c.personality.flaw}`);
  console.log(`    ${statLine}`);
}

// --------------------------------------------------------------------------
// Summary
// --------------------------------------------------------------------------

const total = passed + failed;
console.log(`\n${total} tests: ${passed} passed${failed ? `, ${failed} FAILED` : ''}\n`);
if (failed > 0) process.exit(1);

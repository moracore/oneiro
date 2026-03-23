/**
 * Smoke tests for the syllable-based name generator.
 * Run: node src/generators/nameGenerator.test.js
 */

import { buildName, buildNames } from './syllableGen.js';

// Minimal Mulberry32 seeded PRNG
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --------------------------------------------------------------------------
// Phonetics fixtures — mirrors the JSON data in src/data/names/
// --------------------------------------------------------------------------
const phonetics = {
  orc: {
    _notes: "1-2 syllables, guttural",
    count: { values: [1, 2], weights: [0.45, 0.55] },
    start: {
      male:   ["Gro", "Kru", "Dre", "Bra", "Tho", "Sha", "Ghe", "Gu", "Ke", "Da", "Bo", "Ro", "Mu", "Na", "Ho", "Wa", "Fe", "Ti", "Vo", "Mhu", "Im", "En", "Ag", "Wun"],
      female: ["Ba", "Bo", "Em", "En", "Gha", "Ka", "My", "Ne", "Ov", "Own", "Sha", "Vo", "Ye", "Ro", "Na", "Ke", "Va"],
      unisex: ["Ar", "Bru", "Du", "Gri", "Ha", "Mu", "No", "Ru", "Thr", "Ug", "Va"],
    },
    middle: ["ag", "or", "uk", "em", "on", "ob"],
    end: {
      male:   ["nk", "mp", "rg", "sk", "ng", "sh", "th", "t", "k", "g", "m"],
      female: ["ggi", "ga", "ka", "tha", "la", "va", "da", "sa", "ra"],
      unisex: ["k", "g", "sh", "ng", "ruk", "rag"],
    },
  },

  dwarf: {
    _notes: "2-3 syllables, Nordic-Germanic",
    count: { values: [2, 3], weights: [0.6, 0.4] },
    start: {
      male:   ["Ad", "Al", "Baer", "Bar", "Bro", "Bru", "Dar", "Del", "Ein", "Far", "Gar", "Har", "Kil", "Mor", "Ors", "Os", "Ran", "Ru", "Tak", "Thor", "Tor", "Trau", "Ulf", "Vei", "Von"],
      female: ["Am", "Ar", "Aud", "Bar", "Dag", "Die", "El", "Fal", "Fi", "Gun", "Gur", "Hel", "Hli", "Kath", "Il", "Lif", "Mar", "Ris", "San", "Tor", "Vis"],
    },
    middle: ["ber", "gar", "kar", "dar", "nar", "lin", "rin", "din", "dak", "bek", "rik", "nor"],
    end: {
      male:   ["rik", "rich", "in", "ek", "or", "ok", "al", "gar", "bek", "orn", "inn", "kil", "rim"],
      female: ["ra", "sa", "eth", "da", "dis", "ryn", "ja", "wynn", "hild", "runn", "len", "tra"],
    },
  },

  elf: {
    _notes: "2-4 syllables, flowing",
    count: { values: [2, 3, 4], weights: [0.2, 0.55, 0.25] },
    start: {
      male:   ["Ad", "Ae", "Ar", "Au", "Be", "Bi", "Ca", "En", "Er", "Ga", "Ha", "He", "Im", "Iv", "La", "Mi", "Pa", "Pe", "Qu", "Ri", "Ro", "So", "Tha", "Va"],
      female: ["Ad", "Al", "An", "Be", "Bi", "Ca", "Dr", "En", "Fe", "Ie", "Je", "Ke", "Le", "Li", "Me", "Mi", "Na", "Qu", "Sa", "Sh", "Si", "Th", "Va", "Xa"],
      unisex: ["Ae", "Ar", "El", "En", "Fa", "In", "La", "Na", "Ra", "Sy", "Th", "Va"],
    },
    middle: ["rin", "lin", "dan", "nis", "li", "na", "el", "ia", "an", "ar", "en", "al", "in", "ra", "re", "dra", "nna", "vel", "lis"],
    end: {
      male:   ["an", "ar", "il", "is", "on", "en", "iss", "iel", "or", "ol", "ris"],
      female: ["ia", "ae", "nna", "iel", "el", "ua", "ra", "ynn", "ath", "stra", "phia", "lia"],
      unisex: ["el", "an", "il", "iel", "ia", "on", "ar"],
    },
  },

  gnome: {
    _notes: "2-3 syllables, whimsical",
    count: { values: [2, 3], weights: [0.5, 0.5] },
    start: {
      male:   ["Al", "Bo", "Bro", "Bur", "Di", "El", "Er", "Fo", "Ger", "Gi", "Je", "Kel", "Nam", "Or", "Roon", "See", "Sin", "War", "Zoo"],
      female: ["Bi", "Bre", "Car", "Don", "El", "Ell", "Lil", "Loop", "Lor", "Mar", "Nis", "Od", "Or", "Roy", "Sha", "Ta", "Way", "Zan"],
    },
    middle: ["dy", "bo", "ny", "foo", "mo", "el", "ly", "ro", "wa", "bel", "jo"],
    end: {
      male:   ["ock", "ell", "ble", "ick", "im", "kin", "dle", "yn", "nk", "bo", "dar"],
      female: ["na", "in", "la", "ll", "wick", "tin", "a", "wyn", "il", "nottin", "bell"],
    },
  },

  goliath: {
    _notes: "2-3 syllables, broad vowels, unisex",
    count: { values: [2, 3], weights: [0.4, 0.6] },
    start: ["Au", "Eg", "Gae", "Gau", "Il", "Ke", "Ku", "Lo", "Man", "Ma", "Nal", "Or", "Paa", "Pe", "Tha", "Tho", "U", "Vau", "Vi", "Ka", "Na", "Pa", "Re", "Tu"],
    middle: ["li", "o", "ve", "ne", "kan", "than", "lo", "ka", "ni", "ma", "la", "vu"],
    end: ["kan", "lath", "al", "thak", "ikan", "thi", "ori", "kag", "neo", "ith", "la", "ilo", "vu", "ni", "lai", "tham", "mak"],
  },

  halfling: {
    _notes: "2-3 syllables, comfortable",
    count: { values: [2, 3], weights: [0.65, 0.35] },
    start: {
      male:   ["Al", "An", "Ca", "Cor", "El", "Er", "Fin", "Gar", "Lin", "Ly", "Mer", "Mi", "Os", "Per", "Ros", "Wel"],
      female: ["An", "Bree", "Cal", "Cor", "Eu", "Jil", "Kith", "La", "Lid", "Mer", "Ned", "Pae", "Por", "Se", "Sha", "Va", "Ver"],
    },
    middle: ["rin", "tin", "ra", "li", "na", "ro", "ri", "phi", "la"],
    end: {
      male:   ["ton", "er", "rin", "ret", "dal", "rich", "nan", "by", "le", "lo", "co"],
      female: ["dry", "ee", "lie", "ra", "phia", "lian", "ri", "da", "la", "ia", "na", "wyn"],
    },
  },

  tiefling: {
    _notes: "2-3 syllables, Greek/Semitic-influenced",
    count: { values: [2, 3], weights: [0.55, 0.45] },
    start: {
      male:   ["Ak", "Am", "Ba", "Da", "Ek", "Ia", "Ka", "Leu", "Me", "Mor", "Pe", "Ska", "The", "Kri", "Zer"],
      female: ["Ak", "An", "Bry", "Cri", "Da", "Ea", "Kal", "Le", "Ma", "Ne", "Or", "Phe", "Ri", "Zel"],
    },
    middle: ["me", "ra", "ka", "os", "ei", "ai", "an", "on", "la", "ia", "nas"],
    end: {
      male:   ["os", "on", "is", "nos", "ros", "kos", "mos", "mon", "ios", "aios"],
      female: ["ta", "ia", "eis", "ella", "aia", "a", "ista", "rissa", "aria", "anna"],
    },
  },
};

// --------------------------------------------------------------------------
// Test harness
// --------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`  ✓ ${label}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${label}\n    ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

console.log('\nbuildName() — basic contracts');

test('returns a non-empty string', () => {
  const n = buildName(phonetics.orc, 'male', mulberry32(1));
  assert(typeof n === 'string' && n.length > 0, `got: ${JSON.stringify(n)}`);
});

test('first letter is capitalised', () => {
  for (let seed = 0; seed < 20; seed++) {
    const n = buildName(phonetics.elf, 'female', mulberry32(seed));
    assert(n[0] === n[0].toUpperCase(), `"${n}" should start with capital`);
  }
});

test('rest of name is lowercase', () => {
  for (let seed = 0; seed < 20; seed++) {
    const n = buildName(phonetics.elf, 'male', mulberry32(seed));
    assert(n.slice(1) === n.slice(1).toLowerCase(), `"${n}" — body should be lowercase`);
  }
});

test('same seed → same name', () => {
  const a = buildName(phonetics.orc, 'male', mulberry32(42));
  const b = buildName(phonetics.orc, 'male', mulberry32(42));
  assert(a === b, `${a} !== ${b}`);
});

test('different seeds → variety', () => {
  const names = new Set();
  for (let i = 0; i < 30; i++) {
    names.add(buildName(phonetics.orc, 'male', mulberry32(i)));
  }
  assert(names.size > 8, `only ${names.size} unique names in 30 tries`);
});

console.log('\nbuildName() — syllable length conventions');

test('orc names are short (≤ 10 chars)', () => {
  let overLength = 0;
  for (let i = 0; i < 100; i++) {
    const n = buildName(phonetics.orc, 'male', mulberry32(i));
    if (n.length > 10) overLength++;
  }
  assert(overLength < 5, `${overLength}/100 orc names exceeded 10 chars`);
});

test('elf names are longer on average than orc names', () => {
  let elfTotal = 0, orcTotal = 0;
  for (let i = 0; i < 50; i++) {
    elfTotal += buildName(phonetics.elf, 'female', mulberry32(i)).length;
    orcTotal += buildName(phonetics.orc, 'male',   mulberry32(i)).length;
  }
  assert(elfTotal > orcTotal, `elf avg ${elfTotal/50} ≤ orc avg ${orcTotal/50}`);
});

test('goliath names work with flat (non-gendered) pools', () => {
  const n = buildName(phonetics.goliath, 'unisex', mulberry32(7));
  assert(n && n.length >= 3, `got: ${n}`);
});

console.log('\nbuildNames() — batch generation');

test('returns correct count', () => {
  const names = buildNames(phonetics.dwarf, 'male', mulberry32(99), 5);
  assert(names.length === 5, `expected 5, got ${names.length}`);
});

test('batch names are unique', () => {
  const names = buildNames(phonetics.elf, 'female', mulberry32(100), 10);
  const unique = new Set(names);
  assert(unique.size === names.length, `duplicates in: ${names.join(', ')}`);
});

// --------------------------------------------------------------------------
// Sample output — visual check of phonetic feel
// --------------------------------------------------------------------------

console.log('\nSample output (seed 2024, 8 names each):');

const pairs = [
  ['orc',      'male'],
  ['orc',      'female'],
  ['dwarf',    'male'],
  ['dwarf',    'female'],
  ['elf',      'male'],
  ['elf',      'female'],
  ['elf',      'unisex'],
  ['gnome',    'male'],
  ['gnome',    'female'],
  ['goliath',  'unisex'],
  ['halfling', 'male'],
  ['halfling', 'female'],
  ['tiefling', 'male'],
  ['tiefling', 'female'],
];

for (const [race, gender] of pairs) {
  const ph = phonetics[race];
  if (!ph) continue;
  const names = buildNames(ph, gender, mulberry32(2024), 8);
  const label = `${race} ${gender}`.padEnd(18);
  console.log(`  ${label} → ${names.join(', ')}`);
}

// --------------------------------------------------------------------------
// Summary
// --------------------------------------------------------------------------

const total = passed + failed;
console.log(`\n${total} tests: ${passed} passed${failed ? `, ${failed} FAILED` : ''}\n`);
if (failed > 0) process.exit(1);

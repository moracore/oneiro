# Oneiro — Plan v1

> Starting point: Character Generator (Mode 1)

---

## Oneiro Modes (Full Vision)

Breaking the full design doc into discrete buildable modes:

| # | Mode | What it generates | Depends on |
|---|------|-------------------|------------|
| 1 | **Character Generator** | Standalone NPC/character — name, race, alignment, appearance, mood, ability stats | Nothing (foundation) |
| 2 | **Location Generator** | Settlements (hamlet → capital), structures (tavern, temple, shop…), interiors | Character Generator (for NPCs placed in locations) |
| 3 | **Dungeon Generator** | Dungeon concept, layout, room-by-room generation, secrets, hooks | Character Generator (boss/occupant NPCs), Location Generator (entry points) |
| 4 | **Wilderness Generator** | Wilderness regions, underground spaces, points of interest | Character Generator (NPCs found in wilderness) |
| 5 | **World Generator** | Physical terrain, political boundaries, settlement placement, map rendering | All prior modes (location/dungeon/wilderness seeds hang off the world) |
| 6 | **Lore Forge** | AI-assisted lore development (Mora integration) | World Generator (world-context injection) |

**Shared modules** (built once, used by Modes 2–6):
- Rumors Generator
- Quest Hook Generator
- Faction Generator

These are NOT needed for Mode 1 but should be kept in mind architecturally — the Character Generator's data model should be composable with them later.

---

## Mode 1 — Character Generator

### What it produces

A single generated character card with:

1. **Name** — race and era appropriate
2. **Race** — from a defined race list
3. **Alignment** — classic 9-point grid (Law/Neutral/Chaos × Good/Neutral/Evil)
4. **Appearance** — 3 adjective phrases (one must be a distinctive/memorable detail)
5. **Mood / Personality** — 2 adjective phrases: one strength, one flaw
6. **Ability Scores** — STR, DEX, CON, INT, WIS, CHA with modifiers (standard D&D-style)

### Core principles from the design doc that apply here

- **Seedable PRNG** — every character is generated from a seed. Same seed = same character. Users can share seeds.
- **The Locking System** — any individual field can be locked before rerolling. Lock the name you like, reroll everything else. This is the most important UX feature.
- **Era awareness** — names and some flavor should filter through the active era (Medieval default). Keep era as a setting even if only Medieval is implemented initially.

---

### Race List (starting set)

Standard fantasy races, expandable:

- Human
- Elf
- Dwarf
- Halfling
- Gnome
- Half-Elf
- Half-Orc
- Tiefling
- Dragonborn

Each race needs:
- Name syllable tables (prefix/suffix pools, or full name lists separated by gender marker: masculine / feminine / neutral)
- 1–2 appearance adjective pools unique to the race (e.g. dwarves: stocky, barrel-chested, braided; elves: willowy, sharp-featured, luminous)

---

### Alignment

Nine options on two axes:

```
Lawful Good    | Neutral Good    | Chaotic Good
Lawful Neutral | True Neutral    | Chaotic Neutral
Lawful Evil    | Neutral Evil    | Chaotic Evil
```

Generation: weighted random (True Neutral most common, extremes rarest). User can also pin alignment before generating.

---

### Appearance (3 descriptors)

Generated from layered pools:

- **Build/Body** — one from a pool filtered by race
- **Face/Feature** — one from a general pool (piercing eyes, hooked nose, wide jaw, etc.)
- **Distinctive detail** — always the third; one unusual or memorable detail (a scar, unusual eye color, missing finger, elaborate tattoo, etc.)

Pool structure: `base_pool + race_modifier_pool + era_filter`

---

### Mood / Personality (2 descriptors)

- **Strength** — one positive trait (loyal, perceptive, quick-witted, steadfast, etc.)
- **Flaw** — one negative trait (arrogant, reckless, secretive, paranoid, greedy, etc.)

These should be adjective phrases, not single words — "fiercely loyal" reads better than "loyal". Small flavor improvement, big output quality difference.

---

### Ability Scores

Standard D&D 6-stat block:

| Stat | Abbreviation |
|------|-------------|
| Strength | STR |
| Dexterity | DEX |
| Constitution | CON |
| Intelligence | INT |
| Wisdom | WIS |
| Charisma | CHA |

**Generation method:** 4d6 drop lowest, per stat (standard D&D array method). Seeded so it's reproducible.

**Display:** Score + modifier (e.g. `STR 14 (+2)`).

**Optional:** Race bonuses applied automatically (e.g. Dwarf +2 CON, +1 WIS — PHB standard or configurable).

---

### The Locking System — Implementation Notes

Every generated field has a boolean `locked` state. The UI shows a lock icon per field.

On reroll:
- Locked fields: skip regeneration, keep current value
- Unlocked fields: regenerate from the same or a new seed

State to track per character:
```
{
  seed: string,
  name: { value, locked },
  race: { value, locked },
  alignment: { value, locked },
  appearance: [{ value, locked }, { value, locked }, { value, locked }],
  personality: { strength: { value, locked }, flaw: { value, locked } },
  stats: { STR: { value, locked }, DEX: { value, locked }, ... }
}
```

---

### Tech Stack (Mode 1)

Consistent with the design doc:

- **Frontend:** React + plain CSS (no UI library needed for this scope)
- **PRNG:** `seedrandom` (npm) — drop-in seedable Math.random replacement
- **Storage:** localStorage for current character + seed; JSON export for saving characters
- **No backend required**

---

### Build Order for Mode 1

1. PRNG utility — seeded random, exportable seed
2. Data files — race list, name tables, appearance pools, personality pools, alignment list
3. Generation functions — one per field, all accept seed/offset as input
4. Character state model — with locking
5. UI — character card display with lock toggles and reroll button
6. Seed display + copy — so characters can be shared
7. JSON export — save a character to file

---

### What Mode 1 Does NOT include (yet)

Intentionally deferred to later modes or iterations:

- Role / occupation
- Motivation
- Secret
- Attitude toward strangers
- Relationship hooks
- Era 2 / Era 3 name tables (Medieval only for now)
- Mora / Lore Forge integration
- World context

---

### Future compatibility notes

Mode 1's character object should be designed so it can be extended — not rewritten — when Mode 2 adds role, motivation, secret, and relationship hooks. The locked-field system should be generic enough to handle additional fields without refactoring.

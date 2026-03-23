# ONEIRO

### Design & Concept Document

> _"Every world begins as nothing. Oneiro makes it something."_

---

## Contents

1. [Vision & Philosophy](#1-vision--philosophy)
2. [Era System](#2-era-system)
3. [The Skin System](#3-the-skin-system)
4. [The Axis System](#4-the-axis-system)
5. [Shared Generator Modules](#5-shared-generator-modules)
6. [Settlement Template](#6-settlement-template)
7. [Wilderness Template](#7-wilderness-template)
8. [Underground Template](#8-underground-template)
9. [Structure Template — Exterior Locations](#9-structure-template--exterior-locations)
10. [Interior Locations](#10-interior-locations)
11. [Dungeon Generation](#11-dungeon-generation)
12. [Resident & NPC Housing](#12-resident--npc-housing)
13. [Point of Interest Template](#13-point-of-interest-template)
14. [The World Generator](#14-the-world-generator)
15. [Mora Integration — The Lore Forge](#15-mora-integration--the-lore-forge)
16. [Technical Stack](#16-technical-stack)
17. [Open Source Principles](#17-open-source-principles)

---

## 1. Vision & Philosophy

Oneiro is a procedural world generation tool for tabletop RPG dungeon masters, worldbuilders, writers, and game designers. It generates locations, characters, structures, dungeons, interiors, and entire worlds — with enough detail to run immediately and enough flexibility to make every output feel singular.

The name _Oneiro_ comes from the Greek _oneiros_ — dream. Every world built here starts as nothing and becomes something through a combination of procedural generation, player-controlled axes, and where desired, AI-assisted lore development via the integrated Mora Lore Forge.

### What Oneiro Is

- A procedural generation toolkit for TTRPG and worldbuilding use
- A system built on templates, axes, and skins — not hardcoded location types
- A tool where every generation is seeded and reproducible (same seed = same world)
- A local-first, open-source application with no required accounts
- A platform that will expand across eras, genres, and game systems over time

### What Oneiro Is Not

- A rules engine or character sheet manager
- A map drawing tool in the traditional sense _(the World Generator handles map-level generation procedurally — manual drawing is out of scope)_
- A lore writer — Oneiro generates structure and seeds. The Mora Lore Forge helps you develop your own lore. Neither writes it for you.
- A replacement for a DM's creativity — it is fuel for it

### Core Design Principles

**Consistency over randomness.** Everything is seedable. A DM should be able to return to a generated world and have it be stable.

**Structure first, flavor second.** Generation produces _dramatic and spatial structure_ — relationships, tensions, layouts, secrets. Flavor text is the skin on top of that structure, not the other way around.

**The skin system over hard types.** A Ruined Town is not a separate generator from a Thriving Town. It is the same generator with different axes set. This keeps the codebase lean and the output space vast.

**Modularity.** An NPC generator, a rumors generator, a quest hook generator, and a faction generator are shared modules used across all templates. They are built once and reused everywhere.

**Era awareness.** Every generated element is filtered through the active era setting. A tavern in Medieval England feels different from one in Renaissance Florence or 1920s Chicago. The bones are the same. The skin is era-specific.

---

## 2. Era System

Oneiro launches with three eras. The era is a global setting that filters all generation output — vocabulary, technology, social structures, naming conventions, available building types, faction types, and tone.

Eras are designed to be expanded by the community over time. The era system is documented and open for contribution.

---

### Era 1 — Medieval _(Default)_

**Timeframe:** Roughly 500–1400 CE, fantasy-inflected
**Technology:** Pre-gunpowder, iron and steel, horse-drawn transport, sailing ships
**Social Structure:** Feudalism, church authority, guilds, hereditary nobility
**Magic Presence:** Variable — from low magic gritty to high magic arcane
**Naming Conventions:** Anglo-Saxon, Norse, French Norman, Latin ecclesiastical
**Available Factions:** Noble houses, religious orders, thieves guilds, merchant guilds, knightly orders, arcane circles, druidic circles, peasant rebellions
**Tone Range:** Gritty survival → high fantasy heroism

**Era-specific generation notes:**

- Literacy is rare outside clergy and nobility — this affects NPC knowledge and rumor quality
- Travel is slow and dangerous — distance between settlements matters more
- Religion is a civic institution, not just personal belief — temples are power centers
- Magic (if present) is feared, revered, or both — never mundane

---

### Era 2 — Renaissance _(1400–1650 CE, fantasy-inflected)_

**Timeframe:** Roughly 1400–1650 CE
**Technology:** Early firearms (wheel-lock pistols, arquebus), printing press, advanced sailing, early banking
**Social Structure:** City-states, merchant republics, declining feudalism, rise of professional armies
**Magic Presence:** Fringe — alchemical, scholarly, occult rather than openly arcane
**Naming Conventions:** Italian, Spanish, French, Dutch, German
**Available Factions:** Merchant banks, city councils, condottieri (mercenary companies), inquisitions, printing guilds, explorer companies, secret philosophical societies
**Additional Building Types:** Printing house, bank, university, alchemist's workshop, artist's studio, cartographer's office
**Tone Range:** Political intrigue → swashbuckling adventure

**Era-specific generation notes:**

- Money and trade replace land as primary power currency — merchants rival nobles
- Information is a weapon — the printing press means rumors spread faster and wider
- Gunpowder changes fortification design — castle walls are less effective, bastions appear
- Art and patronage are political tools — who commissions what matters
- Exploration is active — unknown territories exist, maps are contested and valuable

---

### Era 3 — Early 20th Century _(1900–1939, pulp-inflected)_

**Timeframe:** Roughly 1900–1939
**Technology:** Automobiles, telegraphs, early radio, electricity in cities, bolt-action rifles, early aircraft
**Social Structure:** Nation-states, class tensions, organized crime, colonial empires in decline, early labor movements
**Magic Presence:** Hidden — occult societies, forbidden archaeology, Lovecraftian undercurrents, or entirely absent
**Naming Conventions:** English, French, German, American regional, international port city mix
**Available Factions:** Police departments, criminal syndicates, newspaper empires, secret societies, government agencies, labor unions, cult organizations, aristocratic holdovers
**Building Type Translations:** tavern → speakeasy/saloon, blacksmith → garage/mechanic, castle → manor house/estate, temple → church/cult HQ, dungeon → basement/warehouse/underground hideout, wizard's tower → occultist's apartment/laboratory
**Tone Range:** Noir crime → pulp adventure → cosmic horror

**Era-specific generation notes:**

- Cities are large and anonymous — strangers don't know each other, information is harder to trace
- Communication is fast but imperfect — telegraph, telephone, early radio create new rumor dynamics
- Class is explicit and codified — where a character lives tells you everything about their social position
- The supernatural (if present) is hidden, denied, or explained away — discovery is part of the drama
- Violence is more lethal and less ritualized — firearms change encounter dynamics entirely

---

### Expanding the Era System

The era system is designed for community contribution. A new era requires:

- Timeframe definition and technology profile
- Social structure description
- Naming convention set
- Faction type list
- Building type translations
- Era-specific generation notes
- Tone range definition

Planned future eras: Ancient World (Egypt/Greece/Rome), Far East (feudal Japan/China), Post-Apocalyptic, Space Opera, Secondary World Pure Fantasy (no historical anchor).

---

## 3. The Skin System

The skin system is the core architectural decision of Oneiro. Rather than building separate generators for every location type, Oneiro builds **generation templates** with shared data structures, and applies **skins** that change the output flavor, vocabulary, available sub-elements, and dramatic structure.

A **Ruined Town** is not a different generator from a **Thriving Town**. It is the Settlement Template with State: Abandoned. The bones — districts, NPCs, factions, secrets, quest hooks — are the same structure. The skin changes what those bones look like and what they mean.

### How Skins Work

Every skin is a combination of axis values (see Section 4) plus an era filter. The skin changes:

- **Vocabulary** — the words used in generated descriptions
- **Available sub-elements** — a ruined city doesn't generate an active city hall, it generates a collapsed one
- **Dramatic structure** — the kinds of conflicts, secrets, and quest hooks that make sense
- **NPC archetypes** — who lives here and why
- **Faction types** — who has power here and how they hold it

### The Random Skin Button

A dedicated random skin button rolls all axes simultaneously and presents the result. Results are weighted toward coherent combinations but will occasionally produce genuinely surprising outliers. This is one of the most valuable features in the app — DMs love controlled chaos.

---

## 4. The Axis System

Every generated location is defined by a combination of axes. Not all axes apply to all templates.

### Size _(Settlement only)_

`Hamlet` `Village` `Town` `City` `Capital`

### Geography

`Inland` `Coastal/Port` `River` `Mountain/Highland` `Underground/Subterranean` `Island` `Floating/Airborne`

### State

`Thriving` `Declining` `Abandoned` `Corrupted` `Under Construction` `Contested` `Sieged`

### Occupant

`Human — Standard` `Human — Cultural Variant` `Dwarven` `Elven` `Undead` `Monstrous` `Nature-Reclaimed` `Mixed/Contested` `Nobody — Empty`

### Tone

`Welcoming` `Tense` `Dangerous` `Mysterious` `Sacred` `Cursed`

Tone restructures dramatic output — it is not a description anchor:

| Tone       | Quest Hook Type               | Rumors                            | Hidden Secret                     | NPC Default                       |
| ---------- | ----------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| Welcoming  | Opportunity                   | Mostly true                       | Minor scandal                     | Helpful                           |
| Tense      | Political choice              | 50/50 true/false                  | Politically dangerous             | Conflicted loyalties              |
| Dangerous  | Urgent threat                 | Fear and misinformation           | Worsens the danger                | Survival-motivated                |
| Mysterious | Questions, not missions       | Contradicts itself                | Recontextualizes everything       | Knows more than they say          |
| Sacred     | Faith, relics, devotion       | Miracles mixed with propaganda    | Crack in the sacred facade        | Devoted (genuine or performed)    |
| Cursed     | Break or understand the curse | Unreliable — curse affects memory | Origin implicates someone present | Desperate, resigned, or in denial |

### Scale _(Dungeons and Underground only)_

`Small (6–10 rooms)` `Medium (11–20 rooms)` `Large (21–40 rooms)` `Massive (40+ rooms)`

### Layout _(Dungeons and Underground only)_

`Linear` `Branching` `Hub-and-Spoke` `Looping` `Asymmetric` `Vertical`

---

## 5. Shared Generator Modules

These four modules are built once and reused across every template. They are the foundation of the entire system and should be built first.

---

### NPC Generator

**Always generates:**

- Name (era and culture appropriate)
- Role / occupation
- Physical description (3 details — one distinctive)
- Personality (2 traits — one strength, one flaw)
- Motivation (what they want right now)
- Secret (what they're hiding — always present, severity varies)
- Attitude toward strangers (default interaction stance)
- Relationship hook (one connection to another NPC or faction in the same location)

**Optional (flagged by template):**

- Combat capability rating
- Relevant skills or knowledge
- Inventory of note
- Quest they can give

**The Locking System:**
Any field in any generated output can be locked before re-rolling. Lock a name you like, re-roll everything else. Lock a class and a motivation, re-roll appearance and secret. This applies to NPCs, locations, dungeons, and all other templates. It is one of the most important UX features in the app.

---

### Rumors Generator

**Every rumor has:**

- The rumor text (what is being said)
- Truth level (true / partially true / false / misleading)
- Source archetype (who would know this)
- What following up on it leads to

**Rumor table sizes:**

- Hamlet: D4 | Village: D6 | Town: D8 | City: D10 | Capital: D12 | Structures: 2–4

**Tone filters the rumor table:**

- Welcoming: majority true, actionable
- Tense: mixed truth, politically charged
- Dangerous: fear-based, mostly false or exaggerated
- Mysterious: internally contradictory, incomplete
- Sacred: miraculous claims mixed with institutional propaganda
- Cursed: unreliable narrators, memory distortion, circular logic

---

### Quest Hook Generator

**Every hook has:**

- The visible problem (what the players can observe or be told)
- The hidden layer (what's actually going on underneath)
- The stakeholder (who cares about this and why)
- The complication (the thing that makes it not simple)
- Potential reward type (wealth, information, favor, magical, moral)

**Hook types by tone:**

- Welcoming: opportunity hooks | Tense: political hooks | Dangerous: urgency hooks
- Mysterious: investigation hooks | Sacred: faith hooks | Cursed: survival hooks

---

### Faction Generator

**Every faction has:**

- Name and type (era filtered)
- Public goal (what they say they want)
- Private goal (what they actually want)
- Method (how they pursue their goals)
- Resources (what gives them power)
- Weakness (what could bring them down)
- Key NPC (generated via NPC module)
- Attitude toward outsiders (recruit / use / ignore / oppose)
- Current conflict (who they're fighting with and over what)

---

## 6. Settlement Template

All settlements share the same generative skeleton. Size determines slot depth. Geography, State, Occupant, and Tone filter content.

### Universal Settlement Slots _(all sizes)_

- Name
- One-paragraph atmosphere description
- Primary livelihood
- Notable feature (the single most distinctive thing about this specific settlement)
- Current threat or tension (always present — scale varies)
- Hidden secret (DM-facing only)
- Quest hooks (quantity scales with size)
- Rumors table

---

### Hamlet _(~20–80 people)_

**Core slots:**

- Population (specific number — "~40 people" feels more real than "small")
- Primary livelihood
- De facto leader (not formal — the elder, the priest, the loudest farmer)
- 1–2 named NPCs
- 1 notable feature
- 1 quest hook
- D4 rumors
- Core structures: gathering point, shrine or small chapel, 3–5 homes, 1 specialty building

**Conditional:**

- Coastal → small dock or landing, one fisherman NPC, what the sea provides and threatens
- Mountain → extraction resource, who owns the rights, terrain dangers
- Cursed/Dangerous → why they haven't left, what they've already lost
- Abandoned → when they left, what remains, what moved in

**Housing:** 3–8 residential structures (see Section 12)

---

### Village _(~100–800 people)_

**Core slots:**

- Population
- Primary livelihood
- Government (elder council / appointed headman / hereditary / religious authority)
- 3–4 named NPCs with brief relationship notes
- Notable feature
- 2 quest hooks
- D6 rumors
- Core structures: inn or boarding house, general store, shrine or small temple, blacksmith or craftsperson, 1–2 specialty buildings by livelihood

**Conditional:**

- Coastal → docks, harbormaster NPC, fleet size, cargo, smuggling presence
- River → mill, ferry or bridge, upstream/downstream relationships, flood history
- Mountain → extraction output, company or guild presence, road condition
- Tense → the specific conflict, the two sides, the coming flashpoint
- Declining → cause, what's shutting down, who's leaving vs. stuck
- Monstrous Occupant → what drove humans out, what replaced them, survivors in hiding

**Housing:** 15–40 residential structures (see Section 12)

---

### Town _(~1,000–8,000 people)_

**Core slots:**

- Population
- Government type + power holder + opposition
- Districts (2–3: market, residential, one specialty)
- 5–6 named NPCs with relationship web
- Active faction presence (1–2 factions via Faction Generator)
- Town specialty (what it's known for)
- Current major event or tension
- 3 quest hooks
- D8 rumors
- Core structures: inn, tavern, market, temple, blacksmith, guard post, town hall, jail

**Conditional:**

- Coastal → port district, docks, harbormaster as power player, smuggling economy
- River → bridge district, river trade guilds, mill complex, flooding risk
- Mountain → mine district, extraction guild, company housing, labor tensions
- Declining → which businesses are closing, population bleeding, debt or disaster cause
- Sieged → duration, supply state, internal morale fractures, what besiegers want

**Housing:** 80–200 residential structures, grouped by district (see Section 12)

---

### City _(~10,000–80,000 people)_

**Core slots:**

- Population
- Government type + ruling body + named leader + named opposition
- Districts (4–6, each with character, dominant NPC, primary tension)
- 8–10 named NPCs across social strata with relationship web
- Faction landscape (3–4 factions via Faction Generator)
- Major landmarks (3–5 with one-line hook each)
- City economic identity
- Current political situation
- 4–5 quest hooks spanning street level to high politics
- D10 rumors
- Underworld presence (always exists — degree varies)
- Core institutions: city hall/palace district, main temple district, market, barracks, prison, thieves guild presence

**Conditional:**

- Coastal → full port district, naval command, merchant guilds as political power, smuggling economy
- River → bridge districts, river guilds, upstream/downstream diplomatic relationships
- Mountain → vertical city layout, mining economy, defensive identity
- Corrupted → which district fell first, what corruption looks like physically, who profits
- Declining → which districts are emptying, refugee influx, cause
- Sieged → which districts are cut off, food supply timeline, internal loyalties fracturing

**Housing:** Districts of housing — individual homes generated on request

---

### Capital / Major City _(~100,000+ people)_

Everything from City, expanded, plus:

- Full government structure (executive/legislative/judicial equivalents + named individuals)
- Seat of power (palace or equivalent — its own mini-generation: exterior, key rooms, key staff)
- 6–8 districts, each with full mini-description and dominant NPC
- 5–6 major factions with complete Faction Generator output
- 12+ named NPCs, relationship web is a proper graph
- 3–4 major landmarks with full descriptions
- National or regional political situation
- D12 rumors
- Multiple simultaneous power conflicts
- 6+ quest hooks spanning street-level to world-scale

**Optional:**

- Succession crisis (who's dying, who's competing, what factions are doing)
- Secret society at the highest levels
- Ancient foundation (built on something older — what, and whether anyone knows)

---

### Geography Axis — Settlement Additions

**Coastal/Port** adds: dock district or landing (scaled to size), harbormaster NPC, vessel count and type, primary cargo, smuggling operation, sea-based threats, what the sea gives and takes.

**River** adds: crossing infrastructure (ford/ferry/bridge — condition and control), river trade goods, mill or waterwheel, seasonal flood risk, river guilds or fishing community.

**Mountain/Highland** adds: primary extraction resource, rights ownership, road condition, altitude climate effects, defensive advantages and what enemies have tried.

**Island** adds: supply arrival frequency, island production, sea access control, isolation effects on culture.

**Underground/Subterranean** adds: light sources, air quality, surface relationship, unique underground resources.

---

## 7. Wilderness Template

Wilderness locations are spatial rather than social. Generation focuses on layout, atmosphere, encounter potential, and hidden elements.

### Universal Wilderness Slots

- Name
- Type and sub-type
- Atmosphere description (what you notice first, second, third)
- Scale and traversal time
- Primary danger
- Dominant creature presence
- 2–3 notable features
- 1 hidden location (requires effort to find)
- D6 encounter table
- 2 quest hooks

---

### Forest

**Always:** Canopy density, age feel, water presence, dominant tree type (era filtered), defining sounds.

**Conditional:**

- Elven Occupant → hidden settlement, their relationship with outsiders, what they guard
- Corrupted → what corruption looks like (black sap, warped animals, dead zones), spreading or contained, source direction
- Nature-Reclaimed → what it's reclaiming, ruins visible through growth, timeline
- Enchanted/Mysterious Tone → what's wrong with light/time/sound, what lives at the center, what the rules are
- Ancient Battlefield skin → what was fought here, what remains, restless dead presence

**Optional:** Druid circle, fey influence (which court, what rules apply), human encroachment.

---

### Swamp / Bog

**Always:** Water level and navigability, fog density, traversal method, primary hazard, unique visible element.

**Conditional:**

- Inhabited → stilted village or island settlement, what keeps them, what they know
- Cursed → what the curse does to travelers, visible environmental symptoms
- Sacred → what makes it holy, who worships here, what they protect

**Optional:** Hag presence (coven, solitary, type, agenda), sunken ruins, will-o-wisps or luring phenomena.

---

### Mountain Pass

**Always:** Which regions it connects and political significance, traversal difficulty and seasonal access, primary chokepoint, who controls it.

**Conditional:**

- Fortified → garrison, toll/politics, command NPC
- Contested → factions, current state, recent tipping point
- Abandoned → why abandoned, what happened to defenders, what moved in

**Optional:** Smuggling route (almost always present), ancient construction (who built it, why it matters now), monastery or hermit.

---

### Desert

**Always:** Desert type (sand dunes/rocky badlands/salt flat/ash waste/bone fields), scale and traversal time, water source locations, day/night cycle extremes, navigation method.

**Conditional:**

- Inhabited → nomadic culture, trade routes, survival methods, attitude to outsiders
- Ancient Ruins skin → what civilization thrived here, what destroyed it, what remains above and below
- Magical → visible phenomena, what causes them, who is drawn to them

**Optional:** Buried city (discovery trigger, what's preserved, what woke up), oasis (who controls it, what they'll do to keep it), sandstorm mechanics.

---

### Tundra / Frozen Wastes

**Always:** Season state, traversal conditions, primary survival threats beyond cold.

**Conditional:**

- Inhabited → culture that survives here, methods, relationship with outsiders
- Cursed → what the curse is, whether it's spreading south, origin

**Optional:** Something preserved in ice (creature/person/structure/artifact — preservation state, what waking it does), aurora phenomena.

---

### Ancient Battlefield _(Wilderness skin)_

**Always:** Battle name and timeline, who fought, what was at stake, who won. Physical state of the field. Supernatural residue type. Primary danger.

**Conditional:**

- Undead Occupant → organized or mindless, led by whom, what they want or repeat
- Currently Contested → who uses it now and why

---

### Jungle

**Always:** Density and navigability, humidity and physical effects on travelers and equipment, dominant fauna danger, what the jungle is known to contain, what it does to people over time.

**Conditional:**

- Inhabited → culture, relationship with outsiders, what they protect
- Corrupted → visible signs, effect on animal behavior
- Mysterious → what doesn't make sense, what locals won't explain

---

## 8. Underground Template

### Cave System

**Always:** Entry points (number, visibility, defensibility), scale, primary natural feature, natural hazards, dominant creatures, D6 encounter table, 2 quest hooks.

**Conditional:**

- Coastal → tidal access, sea entry points, smuggler use, what tides do to interior sections
- Inhabited → who lives here, how deep, what they've built, surface relationship

**Optional:** Connects to dungeon or underground settlement, ancient formation with spiritual significance, bioluminescent section.

---

### Underground Settlement _(Dwarven / Underdark / etc.)_

Treated as a Settlement Template with Geography: Underground applied, plus:

**Always:** Excavation generation (how it was carved), structural levels and what's on each, light infrastructure, air supply system, surface relationship, unique underground resource that justifies the settlement's existence.

**Conditional:**

- Dwarven → clan structure, forge district, ancestor halls, grudge system
- Underdark → controlling faction, surface access attitude, unique underdark feature
- Abandoned → what drove them out (flood/collapse/creature/plague/something worse)

---

### Sewer System _(city-specific)_

**Always:** Which city, scale, age and construction quality, primary occupant, entry points from street level, what sewers are used for beyond waste, primary hazard, D6 encounter table, 2 quest hooks.

**Conditional:**

- Thieves Guild Present → controlled section, access toll, how to signal passage request
- Monster Occupant → what moved in, how long ago, what it's doing to the city above

---

## 9. Structure Template — Exterior Locations

---

### Tavern / Inn

**Always:** Name, exterior distinctive detail, quality tier (dive/common/comfortable/upscale/exclusive), proprietor NPC, 2–3 regular patron NPCs, menu (cheap/specialty/pride), room availability and price, current atmosphere, 1 active complication, D6 rumors, 1 quest hook.

**Conditional:**

- Coastal/Port → sailor clientele, which ships are in, cargo gossip
- Tense Tone → what the argument is about, when it boils over
- Dangerous Tone → who to avoid, what makes it unsafe
- Upscale → private rooms, what money buys in information
- Early 20th Century → speakeasy or saloon, alcohol legality, back room access

**Optional:** Entertainment, back room (purpose and access), something on the menu that is magical or wrong.

**Interior:** See Section 10.

---

### Blacksmith / Forge

**Always:** Smith's name and reputation, specialty, quality tier, current inventory (5–8 items including one unusual), proprietor NPC, current commission (always working on something), 1 hook.

**Conditional:**

- War/Dangerous Tone → military order backlog, civilian price and access implications
- Declining Settlement → corners being cut, whether they're leaving
- Early 20th Century → garage/mechanic/gunsmith — same structure, different vocabulary

**Optional:** Apprentice NPC, a weapon with a history sitting unsold, something they refuse to make.

**Interior:** See Section 10.

---

### Temple / Shrine

**Always:** Deity or spiritual force, deity's domain (era filtered), physical scale, head clergy NPC, services offered, current congregation character, what the temple wants, what it offers those who help, 1 quest hook.

**Conditional:**

- Sacred Tone → genuine miracle or divine presence, what it does, who exploits it
- Cursed Tone → what's wrong with the divine connection, visible symptoms
- Corrupted State → how clergy is compromised, degree of public knowledge
- Abandoned → why faithful left, what remains of divine presence, benign or dangerous

**Optional:** Hidden vault (relics/records/bodies/secrets), rival religious tension, a supplicant mid-prayer with a visible desperate need.

**Interior:** See Section 10.

---

### Shop / General Store

**Always:** Name, owner NPC, specialty category, inventory feel, 5–7 notable items with prices, current price mood, 1 hook.

**Conditional:**

- Port/Coastal → exotic goods, what ships brought what, provenance questions
- Black Market skin → access signal, who watches, what the risk is
- Declining Settlement → half-empty shelves, owner considering leaving

**Interior:** See Section 10.

---

### Noble Manor / Estate

**Always:** Family name and current head NPC, social standing tier, estate exterior, household staff (3–4 NPCs), family secret, current political alignments, what the family wants right now, 2 quest hooks (one public-facing, one requiring inside access).

**Conditional:**

- Declining → cause of fall, debt level, who is circling
- Tense → internal family conflict, the sides, the prize
- Cursed → what the curse does, whether family knows its origin

**Optional:** Hidden passage or room, locked wing (given reason vs. real reason), a staff member who wants to talk to outsiders.

**Interior:** See Section 10.

---

### Wizard's Tower / Arcane Structure

**Always:** Wizard's name, school, power tier. Tower exterior. Current project and how consuming it is. Attitude toward visitors. 2–3 magical quirks of the structure itself. What the wizard needs. What the wizard has. 1 active complication. 2 quest hooks.

**Conditional:**

- Abandoned → what happened, what's still active, what's loose
- Dangerous Tone → what went wrong and in what ongoing way
- Mysterious Tone → what they won't say, signs it's larger than they admit
- Early 20th Century → occultist's apartment, forbidden archaeologist's warehouse, secret laboratory

**Optional:** Apprentice or familiar NPC, a sealed floor (given reason vs. real reason), something the tower does at a specific time.

**Interior:** See Section 10.

---

### Castle / Keep / Fortification

**Always:** Name and holder, current function, architectural description, current condition, garrison size and loyalty, key NPCs (lord/castellan, captain of guard, one wildcard), defensive strengths and known weaknesses, what the castle controls, current political situation, 3 quest hooks (military / political / secret).

**Conditional:**

- Sieged → duration, supply state, internal morale, what besiegers want and offer
- Abandoned → why abandoned, what moved in, structural integrity
- Prison Function → notable prisoners, guard corruption level, escape attempt history

**Optional:** Dungeon beneath (connects to Underground template), secret passage, a ghost (whose, why still here, what they want).

**Interior:** See Section 10.

---

### Prison / Jailhouse

**Always:** Who runs it, capacity vs. current population, notable prisoner (always one — who, why here, whether they should be), guard roster character, escape difficulty and primary obstacle, 2 quest hooks (break someone out / investigate inside).

**Conditional:**

- Dangerous Tone → something has gone wrong recently, what, whether it's contained
- Early 20th Century → police precinct lockup, county jail, political prison

---

### Library / Archive / University

**Always:** Who controls access and why, primary collection focus, head archivist or librarian NPC, most valuable item (publicly known), most valuable item (secret), who wants access they don't have, 1 quest hook.

**Conditional:**

- Renaissance → printing press presence, what's being copied and distributed, what's being suppressed
- Corrupted → what records have been altered or destroyed, by whom, what they're hiding

---

### Thieves Guild Den / Criminal Headquarters

**Always:** Guild name and leader NPC, public cover (what the building appears to be), how to gain entry, services offered (fencing/contracts/information/protection/forgery), current operation in progress, internal faction tension, relationship with city authority, 2 quest hooks.

---

### Printing House _(Renaissance Era)_

**Always:** Owner NPC and political leanings, current print run, who's paying and what they want, what the owner won't print and why, who wants the press destroyed or controlled, 1 quest hook.

---

### Bank / Counting House _(Renaissance Era)_

**Always:** Institution name, services offered, head banker NPC, current major debtor (someone powerful), current creditor they're afraid of, secret financial arrangement, 1 quest hook.

---

### Speakeasy / Underground Bar _(Early 20th Century)_

**Always:** Front business exterior, entry method, owner NPC and criminal affiliation, clientele character, what's served and where it comes from, who's watching the place, 1 active complication, 1 quest hook.

---

## 10. Interior Locations

Every structure has an interior. Key rooms are always generated. Supporting rooms (storage, hallways, servants' quarters) are generated as lists with brief descriptors, expanded on request.

### Interior Generation Principles

**Every room generates:**

- Name / function
- Dimensions feel (cramped / moderate / spacious / vast)
- Lighting (natural / fire / magical / none)
- Primary contents
- Notable detail (the one thing that makes this room this specific room)
- Interactive element (something that can be searched, used, or triggered)
- Hidden element (optional — requires effort to find)

---

### Tavern Interior

**Common Room**

- Table layout and current occupancy feel
- Bar or serving counter description
- What's mounted on the walls (trophies, wanted posters, decorations, stains)
- The thing that's off or wrong (there's always something)
- Who's in the most prominent seat and why

**Kitchen**

- Condition (clean / functional / disaster)
- Cook NPC (brief)
- What's being prepared
- One thing that shouldn't be in a kitchen

**Proprietor's Office / Back Room**

- Lock quality
- What's kept here (ledgers, lockbox, personal effects, secrets)
- Evidence of the proprietor's real nature

**Guest Rooms** _(generated as a type, individual rooms on request)_

- Quality tier consistent with establishment
- What a previous guest left behind (roll — mundane to significant)
- Lock quality

**Cellar** _(if applicable)_

- What's stored
- Whether the floor is dirt or stone and what that implies
- Hidden access to sewer or tunnel (present in Dangerous/Tense tone always)

---

### Temple Interior

**Nave / Main Hall**

- Seating capacity and current attendance feel
- Altar description and what sits on it
- What the light does here
- What the iconography implies about this specific congregation

**Sanctuary / Inner Sanctum**

- Access restrictions (clergy only / initiated / no restriction)
- What's kept here not shown to the public
- Whether divine presence is tangible in this room

**Clergy Quarters**

- Number of clergy in residence
- Daily schedule and what it means for access
- The room that doesn't match the others

**Vault / Undercroft**

- Whether it exists (always in Sacred/Cursed tone)
- What's stored (relics, bodies, records, contraband, forgotten things)
- Who has the key and whether they know what's really down there

**Confessional / Private Prayer Room** _(era appropriate)_

- Who uses it for its stated purpose
- Who uses it for something else
- Whether it's been used recently and for what

---

### Workshop Interior _(Blacksmith, Carpenter, Alchemist, etc.)_

**Main Workshop**

- Active work state (idle / mid-project / frantic / abandoned mid-task)
- Primary tool arrangement and what it says about the craftsperson
- The commission on the workbench right now
- What smells, sounds, or heat define this room

**Storage / Materials Room**

- Inventory organization (meticulous / chaotic / secretive)
- What's low or missing that shouldn't be
- What's present that raises questions

**Private Area** _(office, sleeping space, or locked room)_

- Whether it's accessible
- What's kept separate from the work
- Personal object that reveals character

---

### Shop Interior

**Salesfloor**

- Display method (shelves, cases, hanging, piled)
- Lighting and how it affects the merchandise
- The item displayed most prominently and why
- Where the owner watches from

**Stock Room**

- Proportion of real inventory vs. displayed
- What's back here that's not on the floor
- Security (locked / alarmed / occupied)

**Counter / Transaction Area**

- Whether there's a back exit and where it goes
- What's kept under or behind the counter
- The ledger — whether visible, what it records

---

### Manor Interior

**Entry Hall / Foyer**

- What's displayed here and what it's meant to communicate vs. what it actually communicates
- Who greets visitors and their manner

**Great Hall / Dining Room**

- Scale relative to family's actual current status
- Table setting (formal / fallen into disuse / converted to something else)
- The family portrait and what's wrong with it

**Lord/Lady's Study**

- Lock quality on the door
- What's on the desk
- What's in the locked drawer
- What the bookshelves reveal about their real interests

**Guest Rooms** _(as type)_

- Quality tier
- Whether guests are currently present
- What a thorough search would find

**Servants' Quarters**

- Condition relative to public areas (tells you everything about the family)
- Which servant has the most access to family secrets
- Whether any servant is a plant (spy, informant, agent)

**Hidden Room / Passage** _(always present in Tense, Dangerous, Mysterious, Cursed tones)_

- Entry method
- What it contains
- Who knows about it

**Cellar / Wine Cellar**

- What's genuinely stored here
- What's hidden among the legitimate storage
- Whether there's tunnel access

---

### Castle Interior

Generated by zone rather than individual room due to scale.

**Great Hall**

- Current function (active throne room / feast hall / military command / fallen into disuse)
- Who holds court here and when
- What the heraldry and trophies reveal about the family's history

**Lord's Chambers**

- Access restrictions and guard rotation
- Personal effects and what they reveal
- Hidden element (secret compartment, passage entry, forbidden item)

**Barracks**

- Troop capacity vs. current garrison
- Morale indicators (equipment condition, food quality, gambling debts)
- The soldier who talks to strangers and what they know

**Armory**

- Current state (full / depleted / unusual items present)
- Who has access and the rotation
- Whether anything is missing and whether anyone knows

**Great Kitchen**

- Who runs it (always a significant NPC — food is power)
- Current food supply level (reveals siege state or prosperity)
- What information flows through the kitchen

**Chapel**

- Denomination and fervor level
- Whether the chaplain is loyal to the lord or to a higher authority
- What's in the chapel that doesn't belong

**Dungeon Level** → Connects to Underground template

**Towers** _(1–4 by scale, each generated as a vertical space)_

- Purpose (watch / storage / prison / magical / residential)
- Who has access
- What's at the top

---

### Tower Interior _(Wizard's / Arcane)_

Generated floor by floor. Number of floors determined by power tier of occupant.

**Floor 1 — Entry / Reception**

- What visitors see immediately and what it's meant to communicate
- Whether the wizard receives visitors here or elsewhere
- Familiar or assistant presence
- Magical security (what happens to the uninvited)

**Floor 2 — Library / Study**

- Organization method (chaotic genius / meticulous / thematic / deliberately misleading)
- What's visibly on the shelves
- What's locked, covered, or warded
- The book that's been read so many times the spine is broken

**Floor 3 — Laboratory**

- Current experiment (stage, what it does or might do)
- Failed experiments visible (what was tried, what went wrong)
- Reagent storage condition
- What's bubbling, burning, or frozen that shouldn't be

**Floor 4+ — Personal / Sealed** _(one per additional floor)_

- Whether accessible to visitors
- What it contains
- What it does if entered without permission

**Roof / Apex**

- What the wizard does here (observation / ritual / communication / sealed)
- What's permanently installed (telescope, ritual circle, summoning anchor, weather instrument)
- What can be seen from here that matters to the plot

---

## 11. Dungeon Generation

Dungeons are fundamentally _designed spaces_ — built with intent, used, abandoned or repurposed, and layered with history. They require their own generation logic.

---

### Dungeon Concept Generation

Before rooms are generated, the dungeon's identity is established:

**Origin — What was this built for?**
`Tomb` `Temple` `Prison` `Fortress/Military` `Mine` `Wizard's Laboratory` `Thieves Guild HQ` `Natural Cave Expanded` `Monster Lair (intelligent construction)` `Planar Outpost` `Sewers (repurposed)`

**History — What happened to the original builders?**
`Defeated in war` `Died of plague` `Fled something they unleashed` `Became the thing they were studying` `Simply abandoned over centuries` `Sealed from inside` `Consumed by their own creation` `Unknown — this is a mystery`

**Current Occupant**
`Undead (original inhabitants)` `Monster group (moved in)` `Criminal organization` `Cult (active ritual use)` `Rival adventuring party` `A single powerful creature` `Nobody — completely empty` `Mixed/layered (multiple groups in different sections)`

**The Central Object — What is at the heart of this dungeon?**
`A tomb and its occupant` `A sealed portal` `A forbidden artifact` `A captive (person, creature, or entity)` `A resource (magical spring, ore vein, ley line nexus)` `A record (truth someone wants buried)` `Nothing — the treasure was a lie` `Something that was never meant to be found`

---

### Layout Generation

**Linear** — One main path with side branches. Good for narrative pace. Players know they're going deeper.

**Branching** — Tree structure from entrance. Multiple paths forward, dead ends, some loops back. Exploration-focused.

**Hub-and-Spoke** — Central chamber with radiating corridors. Every path leads back to the center. The important room is where everyone keeps returning.

**Looping** — Rooms form loops. Players can circle back — so can threats. Creates paranoia.

**Asymmetric** — No clear structure. Feels natural or chaotic. Appropriate for caves, monster-built spaces, or things gone wrong.

**Vertical** — Progress measured by going up or down. Multiple levels, limited connections between them. Falling is a real threat.

---

### Room Generation

**Entrance Chamber**

- How it presents itself (welcoming / threatening / neutral / deceptive)
- First sign of what this dungeon is
- First decision point
- Evidence of what happened to the last people who came through (always visible)

**Trap Room**

- Trap type (mechanical / magical / environmental / creature-triggered)
- Trigger (obvious / hidden / unavoidable)
- Effect (damage / imprisonment / alarm / teleport / something worse)
- Whether the trap is still functional
- Evidence it has fired before and what happened

**Combat Encounter Room**

- Creature type and number
- What they were doing when disturbed
- Tactical features (cover, elevation, chokepoints, hazards)
- What they're protecting
- What they leave behind

**Puzzle / Mystery Room**

- The observable phenomenon
- The mechanism (how it actually works)
- The solution
- What solving it does
- What failing it does
- Clue to solution visible in a previous room

**Rest / Sanctuary Room**

- Why this room is safe (ward, distance, structural isolation)
- What makes it identifiable as relatively safe
- What it costs to use if anything
- What previous visitors left here

**Lore Room**

- What information is present (carvings, murals, journals, bodies with notes)
- What it reveals about the dungeon's history
- What it implies about what's ahead
- Whether any of it is deliberately misleading

**Boss Chamber**

- Scale (must feel different from all other rooms — larger, stranger, or wrong in a specific way)
- The boss and what they're doing when encountered
- Environmental advantages for the boss
- Environmental advantages that players can exploit
- What the room reveals about the dungeon's origin
- What is here besides the boss

**Secret Room**

- Access method (hidden door / magical entrance / requires specific item or knowledge)
- What it contains (cache / revelation / second exit / something that recontextualizes everything)
- Whether anyone else knows it exists

---

### Dungeon-Level Secrets

Every dungeon generates exactly three secrets:

1. **A secret about the past** — something about the original builders or their purpose not apparent from the dungeon's surface presentation
2. **A secret about the present** — something about the current occupant they don't want discovered
3. **A secret about the central object** — something that changes its value, nature, or the moral calculus of obtaining it

---

### Dungeon Quest Hooks

- One hook about recovering the central object
- One hook about the current occupant (the person who sent players here may not have told the full truth)
- One hook requiring return after clearing (something only accessible once threats are removed)

---

## 12. Resident & NPC Housing

Every settlement contains residential structures. Housing generation reveals social stratification, individual character, and private life behind a settlement's public face.

---

### Housing Tiers

**Tier 1 — Destitute**
_Hovels, shelters, repurposed abandoned spaces_

- One-room structure or less (cellar, stable corner, ruined building section)
- No private cooking
- Multiple occupants sharing a space not designed for habitation
- Generates: occupants (1–3, NPC brief), reason for destitution, the one thing they protect above all else, whether anyone knows they're here

---

**Tier 2 — Poor**
_Single or two-room structures, shared walls_

- Main room combining eating/sleeping/living
- Simple hearth, storage corner or chest
- 1–2 occupants or a crowded small family
- Generates: household composition, primary occupation, current financial stress (always present), relationship with immediate neighbors, what they want that they can't afford

---

**Tier 3 — Working Class**
_Multi-room structure, functional but austere_

- Main room / kitchen, 1–2 sleeping rooms, small storage
- May have workshop or trade space attached
- Generates: household composition, occupation(s), current ambition, one source of pride, one active worry, relationship with the neighborhood

---

**Tier 4 — Comfortable / Middle**
_Well-maintained multi-room home, some decorative investment_

- Entry or receiving room, dedicated kitchen, 2–4 sleeping rooms, study or workroom, storage/cellar
- 1–4 occupants, may have one servant
- Generates: family composition and status ambition, occupation (professional/skilled merchant/minor official), social connections, what they display to show status, what they're afraid of losing

---

**Tier 5 — Wealthy**
_Large private home, multiple staff, deliberate status display_

- Entry hall, formal receiving room, dining room, study/library, 4–6 sleeping rooms, servants' quarters (2–4 staff), cellar, possibly private garden
- Generates: family and staff composition, source of wealth, political and social connections, what money hasn't bought, family secret (wealth often has a cost), security measures

---

**Tier 6 — Elite / Noble**
See Noble Manor in Section 9.

---

### Housing by Era

**Medieval:** Tiers 1–3 dominate outside major settlements. Tier 4 is the merchant or skilled craftsperson. Tiers 5–6 are the ruling class. Housing is multigenerational — families don't move.

**Renaissance:** Tier 3 expands significantly as the merchant class grows. Tier 4 becomes aspirational and achievable. Tiers 5–6 compete through architectural display — buildings as status competition.

**Early 20th Century:** Urban Tier 1–2 (tenements, boarding houses) vs. suburban Tier 3–4 (bungalows, row houses). Tier 5 is professional class. Tier 6 is old money or new industrial wealth.

---

### Housing Generation for Named NPCs

When a specific NPC is generated, their housing matches their occupation, status, and secrets. NPC housing always reflects:

- Their tier (consistent with occupation and status)
- One element that reveals private self vs. public persona
- One thing hidden even within the home
- Whether they live alone, with family, or with others who know their secrets

---

### District Housing Generation

For large settlements where individual generation is impractical, housing is generated by district archetype:

**Slum District** — Dense Tier 1–2, overcrowded, disease risk, strong community or strong predation, one local figure maintaining order through reputation alone

**Working District** — Tier 2–3, occupation-clustered (tanners' row, weavers' quarter), noise and smell profiles, guild presence

**Merchant District** — Tier 3–4, competitive display, locksmith and security presence, information moves fast here

**Noble Quarter** — Tier 5–6, private guards, high walls, separate social world, what happens here affects the whole city

---

## 13. Point of Interest Template

Points of interest are map drops — enough detail to reward investigation, not enough to consume generation time if players walk past.

**Every Point of Interest generates:**

- Name
- One-sentence visual description (what you see from distance)
- Surface explanation (what it appears to be)
- True nature (DM-facing)
- 1 quest hook
- Discovery trigger (what draws attention — always present, not always obvious)

---

**Monolith / Standing Stones** — What they do at specific astronomical or magical events. Who built them and why that knowledge was lost. Who comes here now and why.

**Shipwreck** — Ship name, origin, cargo. What sank it. Current state (accessible/submerged/haunted/inhabited). What cargo remains and what would kill you getting to it.

**Bandit Camp** — Size and leader NPC. What they're actually after (not always money). Basic camp layout. Whether they could be allies under the right conditions.

**Druid Grove** — Which circle and their current concern. What they ask of outsiders. What they offer in return. What they will do to those who desecrate.

**Roadside Shrine** — Which deity or local spirit. State of maintenance. Last reported event here. What offering it responds to.

**Ancient Ruins** _(scattered remnants, not a full dungeon)_ — Culture of origin and era. What happened to them. What's above vs. below ground. What looters have taken and what they missed.

**Portal / Magical Anomaly** — Type (portal/ley line eruption/dead magic zone/wild magic area/planar bleed). What it does or where it goes. Stability level. Who knows about it and who wants control.

**Graveyard / Necropolis** — Age and whose dead are interred. Current spiritual status. Who tends it. What's in the oldest section that people don't discuss.

**Abandoned Watchtower** — What it watched for originally. Why abandoned. What uses it now. Whether it still has line of sight to something important.

**Battlefield Memorial / War Grave** — Which conflict, which dead. Maintained or forgotten. Supernatural presence and disposition. What object left here would carry meaning.

---

## 14. The World Generator

The World Generator is the most ambitious and architecturally significant component of Oneiro. It requires the most design thought before implementation. This section describes the intended design — a dedicated design pass will be required before building begins.

---

### The Core Architectural Question

Everything else in Oneiro generates _content_. The World Generator generates _relationships_. A city on a coast has a different character than one in a mountain pass. The World Generator must produce geography and politics first, or nothing is consistent.

**Is the map the entry point** (generate world first, hang all location generation off it) or **is the map optional** (generate locations independently, place them on a map later)?

**Recommended approach:** Build the World Generator as the entry-point system, but design all other generators to also function independently. A DM should be able to generate a standalone tavern without a world. If a world map exists, generating within it should be map-aware.

---

### World Generation Layers

**Layer 1 — Physical World**

- Continental or regional landmass shape (Perlin/Simplex noise for terrain heightmaps)
- Elevation map (mountains, plains, valleys, coastlines)
- Moisture map (derived from elevation + prevailing winds)
- Biome classification (Whittaker model — elevation + moisture = biome type)
- River generation (flow from high to low elevation, to sea or lake)
- Coastline and island generation

**Layer 2 — Political World**

- Voronoi diagrams for kingdom/territory boundaries (seeded by population centers)
- Capital placement (highest defensibility + resource access)
- Settlement placement (rivers, trade routes, resource adjacency)
- Road and trade route generation (optimal path connecting settlements)
- Political relationship generation (allied/at war/neutral — and why)
- Faction presence at regional scale

**Layer 3 — Location Layer**

- Each settlement is a seed for the Settlement Generator
- Each wilderness region gets a Wilderness Generator seed
- Points of Interest scattered according to density settings
- Dungeon placement (in mountains, beneath cities, in wilderness)
- Axes for each location influenced by map position (coastal settlement gets Geography: Coastal automatically)

**Layer 4 — Detail Layer**

- Individual building generation within settlements
- Interior generation on demand
- NPC placement and relationship web generation
- Faction activity at street level

---

### World Seeds

Every world is generated from a seed. Same seed = same world, always. This is non-negotiable — DMs must be able to return to a stable world.

- **Random** — generated at world creation
- **User-defined** — enter a word, phrase, or number
- **Shared** — give another DM your seed and they get your exact world

---

### World Scale Options

**Region** — A single geographic area (valley, island, stretch of coast). Starting area scale. Most detailed, fastest to generate.

**Kingdom** — A full political entity with capital, major cities, borders, and implied neighbors. Standard campaign scale.

**Continent** — Multiple kingdoms, seas, wilderness regions. Broad strokes — detail generated on demand as players explore.

---

### What the World Generator Still Needs

These areas require design work before implementation begins:

- **Map rendering system** — How the map is displayed (2D top-down, illustrated style, hex grid, abstract political). A major UI decision with significant technical implications.
- **Zoom and layer toggling** — Moving between political, geographic, and location layers without losing context.
- **Consistency engine** — When a location is generated within a world, it must not contradict its neighbors. A sacred-tone settlement next to an at-war kingdom needs those facts to cohere.
- **Time system** — Whether the world changes over time (wars end, kings die, plagues spread) or is static once generated.
- **Export format** — How world data is saved and shared between users.

---

### World Generator — Recommended Build Order

1. Physical world generation (terrain, biomes, rivers) — pure procedural algorithm, no AI required
2. Settlement placement algorithm
3. Political boundary generation
4. Connecting world generation to existing location generators
5. Map rendering and UI
6. Consistency engine
7. Time system _(post-launch feature)_

---

## 15. Mora Integration — The Lore Forge

Oneiro integrates a specialized version of the Mora thinking environment. Within Oneiro, this integration is called the **Lore Forge**. See MORA_DESIGN.md for the full Mora specification — this section covers only the Oneiro-specific layer.

---

### What the Lore Forge Is

The Lore Forge is not a lore generator. It does not write your world's history for you. It is a thinking environment that helps you develop _your own_ lore — the history, mythology, culture, and meaning behind the world that Oneiro has procedurally built.

Oneiro generates structure. The Lore Forge helps you develop meaning. The output of a Lore Forge session is always yours.

---

### How the Lore Forge Differs from Standard Mora

The Lore Forge is Mora with a specialized context layer — it is aware of the Oneiro world the user is building.

**Lore Forge additions to the Mora base:**

- **World context injection** — When a Lore Forge session opens, the current world's generated data (settlement names, faction names, geography, political situation) is available as context. The Lore Forge can reference specific generated elements in its questions.
- **Consistency awareness** — The Lore Forge knows what has already been established and will not ask questions that contradict it. It will surface contradictions if it finds them.
- **Lore node output** — Instead of Mora's graph output, the Lore Forge produces lore nodes that attach to specific world elements. A lore node on the capital city becomes part of that city's permanent record in the world.
- **Era awareness** — Questions and provocations are filtered through the active era.

---

### Lore Forge Friction Modes

The Lore Forge uses Mora's 1–5 friction scale (Echo through Yapper) with one addition:

**Lore Mode 0 — Scribe**
A mode below Echo available only in the Lore Forge. Scribe does not ask questions. It takes what you write and formats it as a lore entry, attaching it to the appropriate world element. No friction, no development — pure capture. For DMs who know exactly what they want and just need it recorded cleanly.

---

### Lore Forge Session Types

**Origin Session** — Develop the founding history of a location, faction, or culture. How did this come to exist? What shaped it?

**Conflict Session** — Develop an active conflict. What do both sides want? What do both sides believe? What would end this?

**Mythology Session** — Develop the beliefs, stories, and spiritual life of a people. What do they explain through myth? What does the myth reveal about their fears?

**Character Session** — Develop a specific NPC beyond their generated profile. What formed them? What do they want that they'll never say?

**Consequence Session** — Develop what happens after a major event. The players killed the king. What does that mean for this world?

---

### Lore Storage

Lore Forge output is stored as lore nodes attached to world elements:

- City lore nodes appear when that city is viewed
- Faction lore nodes appear in faction detail views
- Global lore nodes (cosmology, creation myths, calendar systems) are accessible at the world level
- All lore stored in local file system alongside world seed data

---

## 16. Technical Stack

### Frontend

- JavaScript / React
- D3.js for world map rendering and dungeon graph visualization
- Canvas API for procedural terrain generation display
- File System Access API for local storage (browser) or Electron/Tauri for desktop packaging
- Marked.js for lore node markdown rendering

### Generation Layer

- Seedable PRNG — all randomness flows through a seeded pseudo-random number generator. Same seed, same output. Non-negotiable.
- Perlin/Simplex noise for terrain heightmaps
- Voronoi diagrams for political boundary generation
- Template + axis + module architecture throughout
- No backend required for core generation

### AI Layer _(Lore Forge only)_

- User supplies OpenRouter API key — stored locally, never transmitted to any Oneiro server (there is no Oneiro server)
- OpenRouter enables model flexibility — users choose their LLM
- All Mora friction mode system prompts defined in the codebase and open source
- Lore Forge context injection builds a world-aware system prompt from current world data

### Storage

- World data: JSON (world seed, generated location data, political relationships)
- Lore nodes: Markdown files attached to world element IDs
- User preferences: local JSON
- No accounts, no cloud sync by default (users may sync their Oneiro folder via any file sync service)

---

### Recommended Build Order

1. **Shared generator modules** — NPC, Rumors, Quest Hooks, Factions. The foundation everything else uses. Build these first.
2. **Settlement Generator** — Hamlet through Capital, full axis system
3. **Structure Template generators** — Tavern, Blacksmith, Temple, Shop
4. **Interior generation** for the above structures
5. **Dungeon Generator**
6. **Wilderness Template generators**
7. **Underground Template generators**
8. **Point of Interest Template**
9. **Resident Housing system**
10. **Lore Forge** (Mora integration)
11. **World Generator — physical layer** (terrain, biomes, rivers)
12. **World Generator — political layer** (settlements, boundaries, trade routes)
13. **World Generator — location connection** (linking world to location generators)
14. **World Generator — map rendering and UI**
15. **Era 2** (Renaissance) content layer
16. **Era 3** (Early 20th Century) content layer

---

## 17. Open Source Principles

Oneiro is free and open source. This is not a monetization decision — it is a community decision. The TTRPG community supports tools that support them.

- Full codebase on GitHub under MIT License
- All generation templates documented for community extension
- Era system designed for community contribution (see Section 2)
- Seed sharing as a first-class social feature — share your world with another DM
- Contributions prioritized: new era definitions, new location skins, improved generation templates, bug fixes
- The Lore Forge system prompts are open — users can see exactly what instructions the AI operates under

---

_Oneiro — Design Document v0.1 — Foundation_

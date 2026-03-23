import React from 'react';
import {
  PersonIcon, TowerIcon, SkullIcon, TreeIcon, GlobeIcon, FlameIcon,
  BookmarkIcon,
} from './Icons.jsx';

const MODES = [
  {
    id:        'character',
    label:     'Character Generator',
    desc:      'Names, races, alignments, appearance, personality, ability scores.',
    Icon:      PersonIcon,
    available: true,
  },
  {
    id:        'location',
    label:     'Location Generator',
    desc:      'Settlements from hamlet to capital, structures, and interiors.',
    Icon:      TowerIcon,
    available: false,
  },
  {
    id:        'dungeon',
    label:     'Dungeon Generator',
    desc:      'Concepts, layouts, rooms, secrets, and adventure hooks.',
    Icon:      SkullIcon,
    available: false,
  },
  {
    id:        'wilderness',
    label:     'Wilderness Generator',
    desc:      'Regions, underground spaces, and points of interest.',
    Icon:      TreeIcon,
    available: false,
  },
  {
    id:        'world',
    label:     'World Generator',
    desc:      'Terrain, politics, settlement placement, and map rendering.',
    Icon:      GlobeIcon,
    available: false,
  },
  {
    id:        'lore-forge',
    label:     'Lore Forge',
    desc:      'AI-assisted lore development powered by Mora.',
    Icon:      FlameIcon,
    available: false,
  },
];

export default function HomeScreen({ onNavigate, savedCount }) {
  return (
    <div className="layout">
      <header className="topbar">
        <span className="topbar__brand">Oneiro</span>
      </header>

      <main className="scroll-area">
        <div className="home-sheet">

          <p className="home-tagline">
            A procedural world generation toolkit for dungeon masters.
          </p>

          <div className="home-grid">
            {MODES.map(({ id, label, desc, Icon, available }) => (
              <button
                key={id}
                className={`mode-card ${available ? 'mode-card--available' : 'mode-card--locked'}`}
                onClick={available ? () => onNavigate(id) : undefined}
                disabled={!available}
              >
                <div className="mode-card__icon">
                  <Icon size={26} />
                </div>
                <div className="mode-card__body">
                  <span className="mode-card__title">{label}</span>
                  <span className="mode-card__desc">{desc}</span>
                </div>
                {!available && (
                  <span className="mode-card__badge">Soon</span>
                )}
              </button>
            ))}

            {/* Saved */}
            <button
              className="mode-card mode-card--available mode-card--saved"
              onClick={() => onNavigate('saved')}
            >
              <div className="mode-card__icon">
                <BookmarkIcon size={26} />
              </div>
              <div className="mode-card__body">
                <span className="mode-card__title">Saved</span>
                <span className="mode-card__desc">
                  {savedCount === 0
                    ? 'No saved characters yet.'
                    : `${savedCount} saved character${savedCount !== 1 ? 's' : ''}.`}
                </span>
              </div>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { generateCharacter, generateFieldValue, ROLL_MODES } from './generators/characterGen.js';
import { randomSeedString }   from './generators/prng.js';
import HomeScreen             from './components/HomeScreen.jsx';
import CharacterSheet         from './components/CharacterSheet.jsx';
import SavedScreen            from './components/SavedScreen.jsx';

const SAVED_KEY = 'oneiro-saved-characters';

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) ?? []; }
  catch { return []; }
}

function persistSaved(list) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export default function App() {
  const [view, setView]       = useState('home'); // 'home' | 'character' | 'saved'
  const [seedStr, setSeedStr] = useState(() => randomSeedString());
  const [rollMode, setRollMode] = useState('mid');
  const [locked, setLocked]   = useState({});
  const [saved, setSaved]     = useState(loadSaved);

  // Persist saved list whenever it changes
  useEffect(() => { persistSaved(saved); }, [saved]);

  const character = useMemo(
    () => generateCharacter(seedStr, locked, rollMode),
    [seedStr, locked, rollMode],
  );

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigate = useCallback((dest) => {
    if (dest === 'character') {
      // Fresh character if coming from home
      setSeedStr(randomSeedString());
      setLocked({});
      setRollMode('mid');
    }
    setView(dest);
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveCharacter = useCallback((note = '') => {
    const entry = {
      id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      savedAt:   new Date().toISOString(),
      seed:      seedStr,
      rollMode,
      locked,
      character,
      note,
    };
    setSaved(prev => [entry, ...prev]);
  }, [seedStr, rollMode, locked, character]);

  const isSaved = saved.some(e => e.seed === seedStr && e.rollMode === rollMode);

  const deleteSaved = useCallback((id) => {
    setSaved(prev => prev.filter(e => e.id !== id));
  }, []);

  const reorderSaved = useCallback((fromIndex, toIndex) => {
    setSaved(prev => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }, []);

  const loadSavedEntry = useCallback((entry) => {
    setSeedStr(entry.seed);
    setRollMode(entry.rollMode);
    setLocked(entry.locked);
    setView('character');
  }, []);

  // ── Field interactions ────────────────────────────────────────────────────
  const select = useCallback((field, value) => {
    setLocked(prev => ({ ...prev, [field]: value }));
  }, []);

  const rerollField = useCallback((field) => {
    const newValue = generateFieldValue(field, { ...character, rollMode });
    setLocked(prev => ({ ...prev, [field]: newValue }));
  }, [character, rollMode]);

  const toggleLock = useCallback((field) => {
    setLocked(prev => {
      if (field in prev) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      const [top, sub] = field.split('.');
      const val = sub ? character[top][sub] : character[top];
      return { ...prev, [field]: val };
    });
  }, [character]);

  const roll = useCallback(() => setSeedStr(randomSeedString()), []);

  const isLocked = useCallback((key) => key in locked, [locked]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (view === 'home') {
    return (
      <HomeScreen
        onNavigate={navigate}
        savedCount={saved.length}
      />
    );
  }

  if (view === 'saved') {
    return (
      <SavedScreen
        saved={saved}
        onBack={() => setView('home')}
        onLoad={loadSavedEntry}
        onDelete={deleteSaved}
        onReorder={reorderSaved}
      />
    );
  }

  return (
    <CharacterSheet
      character={character}
      isLocked={isLocked}
      onSelect={select}
      onRerollField={rerollField}
      onToggleLock={toggleLock}
      onRoll={roll}
      seed={seedStr}
      onSeedChange={setSeedStr}
      rollMode={rollMode}
      onRollModeChange={setRollMode}
      rollModes={ROLL_MODES}
      onSave={saveCharacter}
      isSaved={isSaved}
      onBack={() => setView('home')}
    />
  );
}

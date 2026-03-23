import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LockClosedIcon, LockOpenIcon, DiceIcon, CopyIcon, RefreshIcon, BookmarkIcon, ArrowLeftIcon } from './Icons.jsx';
import { RACES, GENDERS, STAT_NAMES } from '../generators/characterGen.js';
import alignmentData from '../data/alignments.json';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALIGNMENTS = alignmentData.alignments;

const LAW_ORDER   = ['lawful', 'neutral', 'chaotic'];
const MORAL_ORDER = ['good', 'neutral', 'evil'];

// Map alignment law/moral axes to CSS classes
const LAW_CLS   = { lawful: 'a-law',   neutral: 'a-neutral', chaotic: 'a-chaos' };
const MORAL_CLS = { good: 'a-good',   neutral: 'a-neutral', evil: 'a-evil'   };

// ---------------------------------------------------------------------------
// Tiny pieces
// ---------------------------------------------------------------------------

function LockBtn({ locked, onToggle, label }) {
  return (
    <button
      className={`lock-btn ${locked ? 'lock-btn--on' : ''}`}
      onClick={onToggle}
      aria-label={locked ? `Unlock ${label}` : `Lock ${label}`}
      title={locked ? 'Pinned — click to unpin' : 'Click to pin (survives Roll)'}
    >
      {locked ? <LockClosedIcon size={14} /> : <LockOpenIcon size={14} />}
    </button>
  );
}

function RerollBtn({ onReroll, label }) {
  return (
    <button
      className="reroll-field-btn"
      onClick={onReroll}
      aria-label={`Reroll ${label}`}
      title={`Reroll ${label}`}
    >
      <DiceIcon size={14} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Name — click to edit inline
// ---------------------------------------------------------------------------

function NameField({ name, isLocked, onSelect, onReroll, onToggleLock }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState('');
  const inputRef              = useRef(null);

  function startEdit() {
    setDraft(name);
    setEditing(true);
  }

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) onSelect('name', trimmed);
    setEditing(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter')  commit();
    if (e.key === 'Escape') setEditing(false);
  }

  return (
    <div className="name-field">
      {editing ? (
        <input
          ref={inputRef}
          className="name-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          spellCheck={false}
        />
      ) : (
        <h1 className="char-name" onClick={startEdit} title="Click to edit name">
          {name}
        </h1>
      )}
      <div className="name-field__actions">
        <RerollBtn onReroll={() => onReroll('name')} label="name" />
        <LockBtn locked={isLocked('name')} onToggle={() => onToggleLock('name')} label="name" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Race selector — pill grid
// ---------------------------------------------------------------------------

function RaceSelector({ race, isLocked, onSelect, onToggleLock }) {
  return (
    <div className="selector-group">
      <div className="selector-label">
        Race
        <LockBtn locked={isLocked('race')} onToggle={() => onToggleLock('race')} label="race" />
      </div>
      <div className="pill-grid">
        {RACES.map(r => (
          <button
            key={r}
            className={`pill ${r === race ? 'pill--active' : ''}`}
            onClick={() => onSelect('race', r)}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gender selector — 3 buttons
// ---------------------------------------------------------------------------

function GenderSelector({ gender, isLocked, onSelect, onToggleLock }) {
  return (
    <div className="selector-group">
      <div className="selector-label">
        Gender
        <LockBtn locked={isLocked('gender')} onToggle={() => onToggleLock('gender')} label="gender" />
      </div>
      <div className="pill-row">
        {GENDERS.map(g => (
          <button
            key={g}
            className={`pill ${g === gender ? 'pill--active' : ''}`}
            onClick={() => onSelect('gender', g)}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alignment selector — 3 × 3 grid
// ---------------------------------------------------------------------------

function AlignmentSelector({ alignment, isLocked, onSelect, onToggleLock }) {
  // Build 3×3 grid in law (cols) × moral (rows) order
  const grid = MORAL_ORDER.map(moral =>
    LAW_ORDER.map(law =>
      ALIGNMENTS.find(a => a.law === law && a.moral === moral)
    )
  );

  return (
    <div className="selector-group">
      <div className="selector-label">
        Alignment
        <LockBtn locked={isLocked('alignment')} onToggle={() => onToggleLock('alignment')} label="alignment" />
      </div>
      <div className="alignment-grid">
        {grid.map((row, ri) =>
          row.map(a => (
            <button
              key={a.id}
              className={`alignment-cell ${LAW_CLS[a.law]} ${MORAL_CLS[a.moral]} ${a.id === alignment.id ? 'alignment-cell--active' : ''}`}
              onClick={() => onSelect('alignment', a)}
              title={`${a.label} — ${a.flavour}`}
            >
              {a.short}
            </button>
          ))
        )}
      </div>
      <p className="alignment-flavour">{alignment.flavour}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field row (appearance / personality)
// ---------------------------------------------------------------------------

function FieldRow({ label, value, lockKey, isLocked, onToggleLock, onReroll }) {
  return (
    <div className={`field-row ${isLocked(lockKey) ? 'field-row--locked' : ''}`}>
      <div className="field-body">
        <span className="field-label">{label}</span>
        <span className="field-value">{value}</span>
      </div>
      <div className="field-actions">
        <RerollBtn onReroll={() => onReroll(lockKey)} label={label} />
        <LockBtn locked={isLocked(lockKey)} onToggle={() => onToggleLock(lockKey)} label={label} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat block
// ---------------------------------------------------------------------------

function StatCell({ name, score, modifier, onReroll }) {
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  return (
    <div className="stat-cell">
      <span className="stat-name">{name}</span>
      <span className="stat-score">{score}</span>
      <span className={`stat-mod ${modifier > 0 ? 'pos' : modifier < 0 ? 'neg' : ''}`}>
        {modStr}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seed bar
// ---------------------------------------------------------------------------

function SeedBar({ seed, onSeedChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState('');
  const [copied, setCopied]   = useState(false);

  function startEdit() { setDraft(seed); setEditing(true); }

  function commit(e) {
    e?.preventDefault();
    if (draft.trim()) onSeedChange(draft.trim());
    setEditing(false);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(seed).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <div className="seed-bar">
      <span className="seed-label">Seed</span>
      {editing ? (
        <form onSubmit={commit} style={{ flex: 1, minWidth: 0 }}>
          <input
            className="seed-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            autoFocus
            spellCheck={false}
          />
        </form>
      ) : (
        <button className="seed-value" onClick={startEdit} title="Click to set a custom seed">
          {seed}
        </button>
      )}
      <button className="icon-btn" onClick={handleCopy} title="Copy seed">
        {copied ? <span className="copied-text">Copied</span> : <CopyIcon size={14} />}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({ title, children }) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Save modal
// ---------------------------------------------------------------------------

function SaveModal({ onConfirm, onCancel }) {
  const [note, setNote] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onConfirm(note.trim()); }
    if (e.key === 'Escape') onCancel();
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <p className="modal__title">Add a note</p>
        <textarea
          ref={inputRef}
          className="modal__note-input"
          placeholder="Optional — e.g. 'Tavern keeper in Ashford'"
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
        />
        <div className="modal__actions">
          <button className="modal__cancel" onClick={onCancel}>Cancel</button>
          <button className="roll-btn roll-btn--sm" onClick={() => onConfirm(note.trim())}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function CharacterSheet({
  character, isLocked,
  onSelect, onRerollField, onToggleLock,
  onRoll, seed, onSeedChange,
  rollMode, onRollModeChange, rollModes,
  onSave, onBack, isSaved,
}) {
  const { race, gender, name, alignment, appearance, personality, stats } = character;
  const [showModal, setShowModal] = useState(false);

  function handleBookmarkClick() { setShowModal(true); }
  function handleModalConfirm(note) { onSave(note); setShowModal(false); }
  function handleModalCancel() { setShowModal(false); }

  return (
    <div className="layout">

      {showModal && (
        <SaveModal onConfirm={handleModalConfirm} onCancel={handleModalCancel} />
      )}

      <header className="topbar">
        <button className="icon-btn topbar__back" onClick={onBack} aria-label="Home">
          <ArrowLeftIcon size={16} />
        </button>
        <span className="topbar__brand">Oneiro</span>
        <div className="topbar__actions">
          <button
            className="icon-btn"
            onClick={handleBookmarkClick}
            aria-label="Save character"
            title={isSaved ? 'Saved' : 'Save character'}
            style={{ color: isSaved ? 'var(--accent)' : undefined }}
          >
            <BookmarkIcon size={16} filled={isSaved} />
          </button>
          <button className="roll-btn" onClick={onRoll}>
            <DiceIcon size={16} />
            Roll
          </button>
        </div>
      </header>

      <main className="scroll-area">
        <div className="sheet">

          {/* ── Name ── */}
          <div className="card">
            <NameField
              name={name}
              isLocked={isLocked}
              onSelect={onSelect}
              onReroll={onRerollField}
              onToggleLock={onToggleLock}
            />
          </div>

          {/* ── Race + Gender ── */}
          <div className="card card--row">
            <RaceSelector
              race={race}
              isLocked={isLocked}
              onSelect={onSelect}
              onToggleLock={onToggleLock}
            />
            <GenderSelector
              gender={gender}
              isLocked={isLocked}
              onSelect={onSelect}
              onToggleLock={onToggleLock}
            />
          </div>

          {/* ── Stats ── */}
          <Section title="Ability Scores">
            <div className="roll-mode-bar">
              {rollModes.map(m => (
                <button
                  key={m.id}
                  className={`pill ${m.id === rollMode ? 'pill--active' : ''}`}
                  onClick={() => onRollModeChange(m.id)}
                  title={m.label}
                >
                  {m.label}
                </button>
              ))}
              <RerollBtn onReroll={() => onRerollField('stats')} label="all stats" />
              <LockBtn locked={isLocked('stats')} onToggle={() => onToggleLock('stats')} label="stats" />
            </div>
            <div className="stat-grid">
              {STAT_NAMES.map(s => (
                <StatCell
                  key={s}
                  name={s}
                  score={stats[s].score}
                  modifier={stats[s].modifier}
                />
              ))}
            </div>
          </Section>

          {/* ── Alignment ── */}
          <div className="card">
            <AlignmentSelector
              alignment={alignment}
              isLocked={isLocked}
              onSelect={onSelect}
              onToggleLock={onToggleLock}
            />
          </div>

          {/* ── Appearance ── */}
          <Section title="Appearance">
            <FieldRow label="Build"       value={appearance.build}       lockKey="appearance.build"       isLocked={isLocked} onToggleLock={onToggleLock} onReroll={onRerollField} />
            <FieldRow label="Feature"     value={appearance.feature}     lockKey="appearance.feature"     isLocked={isLocked} onToggleLock={onToggleLock} onReroll={onRerollField} />
            <FieldRow label="Distinctive" value={appearance.distinctive} lockKey="appearance.distinctive" isLocked={isLocked} onToggleLock={onToggleLock} onReroll={onRerollField} />
          </Section>

          {/* ── Personality ── */}
          <Section title="Personality">
            <FieldRow label="Strength" value={personality.strength} lockKey="personality.strength" isLocked={isLocked} onToggleLock={onToggleLock} onReroll={onRerollField} />
            <FieldRow label="Flaw"     value={personality.flaw}     lockKey="personality.flaw"     isLocked={isLocked} onToggleLock={onToggleLock} onReroll={onRerollField} />
          </Section>

        </div>
      </main>

      <footer className="footer">
        <SeedBar seed={seed} onSeedChange={onSeedChange} />
        <button className="roll-btn roll-btn--sm" onClick={onRoll}>
          <RefreshIcon size={14} />
          Reroll All
        </button>
      </footer>

    </div>
  );
}

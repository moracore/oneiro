import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeftIcon, TrashIcon, GripIcon } from './Icons.jsx';

const LAW_LABEL   = { lawful: 'L', neutral: 'N', chaotic: 'C' };
const MORAL_LABEL = { good: 'G', neutral: 'N', evil: 'E' };

function alignmentShort(a) {
  if (!a) return '—';
  return a.short || `${LAW_LABEL[a.law] ?? '?'}${MORAL_LABEL[a.moral] ?? '?'}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Individual card (also used for ghost — pass ghost=true to strip interaction)
// ---------------------------------------------------------------------------

function SavedCard({ entry, onLoad, onDelete, ghost, dragIndex, insertAt, index, itemH, gripRef, onGripPointerDown }) {
  const { character, savedAt, note } = entry;
  const { name, race, gender, alignment, stats } = character;

  const statTotal = stats
    ? Object.values(stats).reduce((sum, s) => sum + s.score, 0)
    : null;

  let transform;
  if (!ghost && dragIndex !== null && index !== dragIndex) {
    const shift = (itemH ?? 0) + 6;
    if (dragIndex < insertAt && index > dragIndex && index <= insertAt)
      transform = `translateY(-${shift}px)`;
    else if (dragIndex > insertAt && index < dragIndex && index >= insertAt)
      transform = `translateY(${shift}px)`;
  }

  const isPlaceholder = !ghost && dragIndex !== null && index === dragIndex;

  return (
    <div
      className={`saved-card ${ghost ? 'saved-card--ghost' : ''} ${isPlaceholder ? 'saved-card--placeholder' : ''}`}
      style={{ transform, transition: ghost ? undefined : 'transform 180ms ease' }}
    >
      <div
        ref={ghost ? undefined : gripRef}
        className="saved-card__grip"
        title="Drag to reorder"
        onPointerDown={ghost ? undefined : onGripPointerDown}
      >
        <GripIcon size={15} />
      </div>
      <div
        className="saved-card__main"
        onClick={ghost || isPlaceholder ? undefined : onLoad}
        role={ghost ? undefined : 'button'}
        tabIndex={ghost ? undefined : 0}
        onKeyDown={ghost ? undefined : e => e.key === 'Enter' && onLoad()}
      >
        <div className="saved-card__name-row">
          <span className="saved-card__name">{name}</span>
          {note && <span className="saved-card__note">{note}</span>}
        </div>
        <div className="saved-card__meta">
          <span>{race}</span>
          <span className="saved-card__dot">·</span>
          <span style={{ textTransform: 'capitalize' }}>{gender}</span>
          <span className="saved-card__dot">·</span>
          <span>{alignmentShort(alignment)}</span>
          {statTotal !== null && (
            <>
              <span className="saved-card__dot">·</span>
              <span>Σ{statTotal}</span>
            </>
          )}
          <span className="saved-card__dot">·</span>
          <span className="saved-card__date">{formatDate(savedAt)}</span>
        </div>
      </div>
      {!ghost && (
        <button
          className="saved-card__delete"
          onClick={isPlaceholder ? undefined : onDelete}
          aria-label="Delete saved character"
          title="Delete"
        >
          <TrashIcon size={14} />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function SavedScreen({ saved, onBack, onLoad, onDelete, onReorder }) {
  const [drag, setDrag] = useState(null);
  // drag = { index, insertAt, ghostX, ghostY, ghostW, itemH, offsetY }

  const itemRefs  = useRef([]);
  const gripRefs  = useRef([]);

  // ── Start drag ────────────────────────────────────────────────────────────
  const startDrag = useCallback((e, index) => {
    e.preventDefault();
    const el = itemRefs.current[index];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Snapshot all original midpoints now — used throughout the drag so
    // detection stays stable even as items shift with CSS transforms.
    const origMids = itemRefs.current.map(r => {
      const b = r?.getBoundingClientRect();
      return b ? b.top + b.height / 2 : 0;
    });
    gripRefs.current[index]?.setPointerCapture(e.pointerId);
    setDrag({
      index,
      insertAt: index,
      ghostX:   rect.left,
      ghostY:   rect.top,
      ghostW:   rect.width,
      itemH:    rect.height,
      offsetY:  e.clientY - rect.top,
      origMids,
    });
  }, []);

  // ── Move ──────────────────────────────────────────────────────────────────
  const onPointerMove = useCallback((e) => {
    if (!drag) return;
    const ghostY  = e.clientY - drag.offsetY;
    const centerY = ghostY + drag.itemH / 2;

    // Use original midpoints (captured at drag start) so insertAt can return
    // to drag.index when the ghost goes back to its starting position.
    let insertAt = 0;
    for (let i = 0; i < drag.origMids.length; i++) {
      if (centerY > drag.origMids[i]) insertAt = i;
    }

    setDrag(prev => ({ ...prev, ghostY, insertAt }));
  }, [drag]);

  // ── End drag ──────────────────────────────────────────────────────────────
  const onPointerUp = useCallback(() => {
    if (!drag) return;
    if (drag.insertAt !== drag.index) onReorder(drag.index, drag.insertAt);
    setDrag(null);
  }, [drag, onReorder]);

  return (
    <div className="layout" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <header className="topbar">
        <button className="icon-btn topbar__back" onClick={onBack} aria-label="Back">
          <ArrowLeftIcon size={16} />
        </button>
        <span className="topbar__brand">Saved</span>
        <span style={{ width: 32 }} />
      </header>

      <main className="scroll-area">
        <div className="sheet">
          {saved.length === 0 ? (
            <div className="saved-empty">
              <p>No saved characters yet.</p>
              <p>Hit the bookmark icon while viewing a character to save it here.</p>
            </div>
          ) : (
            <div className="saved-list">
              {saved.map((entry, index) => (
                <div
                  key={entry.id}
                  ref={el => itemRefs.current[index] = el}
                >
                  <SavedCard
                    entry={entry}
                    index={index}
                    dragIndex={drag?.index ?? null}
                    insertAt={drag?.insertAt ?? null}
                    itemH={drag?.itemH ?? null}
                    onLoad={() => onLoad(entry)}
                    onDelete={() => onDelete(entry.id)}
                    gripRef={el => gripRefs.current[index] = el}
                    onGripPointerDown={e => startDrag(e, index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Ghost — follows cursor */}
      {drag && (
        <div
          className="drag-ghost-wrapper"
          style={{
            position: 'fixed',
            top:      drag.ghostY,
            left:     drag.ghostX,
            width:    drag.ghostW,
            zIndex:   200,
            pointerEvents: 'none',
          }}
        >
          <SavedCard
            entry={saved[drag.index]}
            index={drag.index}
            dragIndex={null}
            insertAt={null}
            itemH={null}
            ghost
          />
        </div>
      )}
    </div>
  );
}

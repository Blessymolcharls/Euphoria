import React, { useState, useCallback } from 'react';
import DotText from '../components/DotMatrix/DotText';
import './DotTypography.css';

/* ── Colour presets ──────────────────────────────────────────── */
const PRESETS = [
  { label: 'Arctic White', color: '#ffffff', glow: '#ffffff', glowBlur: 3 },
  { label: 'Ice Blue',     color: '#a8d8ff', glow: '#60b8ff', glowBlur: 4 },
  { label: 'Plasma Red',   color: '#ff3355', glow: '#ff0033', glowBlur: 5 },
  { label: 'Mint',         color: '#7fffc4', glow: '#00e8a0', glowBlur: 4 },
  { label: 'Solar Gold',   color: '#ffd166', glow: '#ffbb00', glowBlur: 4 },
  { label: 'Soft Gray',    color: '#aaaaaa', glow: '#888888', glowBlur: 2 },
];

/* ── Full alphabet + digits for the showcase ─────────────────── */
const ALPHA_ROW   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS_ROW  = '0123456789';
const SAMPLE_TEXT = 'NOTHING OS';
const SAMPLE_SUB  = 'DOT MATRIX';

export default function DotTypography() {
  /* Sandbox state */
  const [sandboxText,  setSandboxText]  = useState('EUPHORIA');
  const [dotSize,      setDotSize]      = useState(5);
  const [gap,          setGap]          = useState(9);
  const [letterGap,    setLetterGap]    = useState(7);
  const [glowBlur,     setGlowBlur]     = useState(3);
  const [pulse,        setPulse]        = useState(false);
  const [selectedPreset, setPreset]     = useState(0);
  const [replayKey,    setReplayKey]    = useState(0);

  const preset = PRESETS[selectedPreset];

  const replay = useCallback(() => setReplayKey(k => k + 1), []);

  return (
    <main className="dot-page">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="dot-page__hero">
        <p className="dot-page__eyebrow">Nothing OS · Dot Matrix Typography</p>

        <DotText
          text={SAMPLE_TEXT}
          dotSize={7}
          gap={12}
          letterGap={10}
          glowBlur={4}
          animated
        />

        <DotText
          text={SAMPLE_SUB}
          dotSize={4}
          gap={8}
          letterGap={7}
          color="rgba(255,255,255,0.45)"
          offOpacity={0.04}
          glowBlur={2}
          animated
          pulse
        />

        <p className="dot-page__subtitle">
          Soft circular dots. Airy spacing. Futuristic glow.<br />
          Every glyph hand-crafted on a 5 × 7 grid.
        </p>
      </section>

      {/* ── SIZES ────────────────────────────────────── */}
      <section className="dot-section">
        <span className="dot-section__label">Scale</span>
        <div className="dot-section__content">
          <div className="dot-sizes">
            {[
              { label: 'XS', dotSize: 3, gap: 6,  letterGap: 5 },
              { label: 'SM', dotSize: 4, gap: 8,  letterGap: 6 },
              { label: 'MD', dotSize: 5, gap: 9,  letterGap: 7 },
              { label: 'LG', dotSize: 7, gap: 12, letterGap: 10 },
              { label: 'XL', dotSize: 9, gap: 15, letterGap: 12 },
            ].map(({ label, dotSize: ds, gap: g, letterGap: lg }) => (
              <div key={label} className="dot-size-row">
                <span className="dot-size-row__tag">{label}</span>
                <DotText
                  text="NOTHING"
                  dotSize={ds}
                  gap={g}
                  letterGap={lg}
                  glowBlur={ds / 2}
                  offOpacity={0.06}
                  animated
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLOURS ──────────────────────────────────── */}
      <section className="dot-section">
        <span className="dot-section__label">Colour Presets</span>
        <div className="dot-section__content">
          <div className="dot-colors">
            {PRESETS.map(({ label, color, glow, glowBlur: gb }) => (
              <DotText
                key={label}
                text={label.toUpperCase()}
                dotSize={5}
                gap={9}
                letterGap={7}
                color={color}
                glowColor={glow}
                glowBlur={gb}
                offOpacity={0.05}
                animated
                label={label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── ALPHABET ─────────────────────────────────── */}
      <section className="dot-section">
        <span className="dot-section__label">Character Set</span>
        <div className="dot-section__content">
          <div className="dot-alphabet">
            {ALPHA_ROW.split('').map(ch => (
              <DotText
                key={ch}
                text={ch}
                dotSize={4}
                gap={8}
                letterGap={0}
                glowBlur={2.5}
                offOpacity={0.05}
                animated
              />
            ))}
          </div>
          <div className="dot-alphabet">
            {DIGITS_ROW.split('').map(ch => (
              <DotText
                key={ch}
                text={ch}
                dotSize={4}
                gap={8}
                letterGap={0}
                glowBlur={2.5}
                offOpacity={0.05}
                animated
              />
            ))}
            {'.,!?-: '.split('').map(ch => (
              <DotText
                key={`sym-${ch.charCodeAt(0)}`}
                text={ch}
                dotSize={4}
                gap={8}
                letterGap={0}
                glowBlur={2.5}
                offOpacity={0.05}
                animated
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SANDBOX ──────────────────────────────────── */}
      <section className="dot-section">
        <span className="dot-section__label">Interactive Sandbox</span>
        <div className="dot-section__content">
          <div className="dot-sandbox">

            {/* Controls row */}
            <div className="dot-sandbox__controls">

              <input
                className="dot-sandbox__input"
                type="text"
                value={sandboxText}
                maxLength={20}
                placeholder="Type something…"
                onChange={e => setSandboxText(e.target.value.toUpperCase())}
                aria-label="Sandbox text input"
              />

              {/* Preset picker */}
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  className="btn-ghost"
                  style={{
                    borderColor: selectedPreset === i
                      ? p.color
                      : 'rgba(255,255,255,0.1)',
                    color: selectedPreset === i ? p.color : 'rgba(255,255,255,0.4)',
                  }}
                  onClick={() => setPreset(i)}
                  aria-pressed={selectedPreset === i}
                  title={p.label}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div className="dot-sandbox__controls">
              <div className="dot-sandbox__slider-group">
                <span className="dot-sandbox__slider-label">Dot Size {dotSize}px</span>
                <input type="range" className="dot-sandbox__slider"
                  min={2} max={12} step={1} value={dotSize}
                  onChange={e => setDotSize(Number(e.target.value))}
                  aria-label="Dot size"
                />
              </div>
              <div className="dot-sandbox__slider-group">
                <span className="dot-sandbox__slider-label">Grid Gap {gap}px</span>
                <input type="range" className="dot-sandbox__slider"
                  min={5} max={18} step={1} value={gap}
                  onChange={e => setGap(Number(e.target.value))}
                  aria-label="Grid gap"
                />
              </div>
              <div className="dot-sandbox__slider-group">
                <span className="dot-sandbox__slider-label">Letter Gap {letterGap}px</span>
                <input type="range" className="dot-sandbox__slider"
                  min={2} max={24} step={1} value={letterGap}
                  onChange={e => setLetterGap(Number(e.target.value))}
                  aria-label="Letter gap"
                />
              </div>
              <div className="dot-sandbox__slider-group">
                <span className="dot-sandbox__slider-label">Glow {glowBlur}</span>
                <input type="range" className="dot-sandbox__slider"
                  min={0} max={8} step={0.5} value={glowBlur}
                  onChange={e => setGlowBlur(Number(e.target.value))}
                  aria-label="Glow intensity"
                />
              </div>
              <label className="dot-sandbox__toggle">
                <input
                  type="checkbox"
                  checked={pulse}
                  onChange={e => setPulse(e.target.checked)}
                  aria-label="Toggle pulse animation"
                />
                <span>Pulse</span>
              </label>
              <button className="btn-ghost" onClick={replay} title="Replay animation">
                ↺ Replay
              </button>
            </div>

            {/* Live preview */}
            <div className="dot-sandbox__preview">
              <DotText
                key={replayKey}
                text={sandboxText || 'NOTHING'}
                dotSize={dotSize}
                gap={gap}
                letterGap={letterGap}
                color={preset.color}
                glowColor={preset.glow}
                glowBlur={glowBlur}
                offOpacity={0.06}
                animated
                pulse={pulse}
                label={sandboxText}
              />
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}

import React, { memo } from 'react';
import font, { DOT_COLS, DOT_ROWS } from './dotFont';

/**
 * DotChar — renders a single character as an SVG dot-matrix glyph.
 * Memoized: only re-renders when props change.
 */
const DotChar = memo(function DotChar({
  char = ' ',
  dotSize = 6,
  gap = 10,
  color = '#ffffff',
  glowBlur = 3,
  offOpacity = 0.07,
  animDelay = 0,
  animated = true,
}) {
  const upper = char.toUpperCase();
  const matrix = font[upper] || font[' '];

  const r = dotSize / 2;
  const W = DOT_COLS * gap;
  const H = DOT_ROWS * gap;

  // Stable filter id — doesn't change across renders for same char
  const filterId = `glow-${char.charCodeAt(0)}-${Math.round(glowBlur * 10)}`;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={`dot-char${animated ? ' dot-char--animated' : ''}`}
      style={{ '--anim-delay': `${animDelay * 0.04}s` }}
      aria-hidden="true"
      overflow="visible"
    >
      {glowBlur > 0 && (
        <defs>
          <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={glowBlur} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {matrix.map((row, rowIdx) =>
        row.map((on, colIdx) => {
          const cx = colIdx * gap + gap / 2;
          const cy = rowIdx * gap + gap / 2;
          return (
            <circle
              key={`${rowIdx}-${colIdx}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={color}
              fillOpacity={on ? 1 : offOpacity}
              filter={on && glowBlur > 0 ? `url(#${filterId})` : undefined}
              className={on ? 'dot dot--on' : 'dot dot--off'}
              style={
                animated && on
                  ? { '--dot-delay': `${(rowIdx * DOT_COLS + colIdx) * 0.012}s` }
                  : {}
              }
            />
          );
        })
      )}
    </svg>
  );
});

export default DotChar;

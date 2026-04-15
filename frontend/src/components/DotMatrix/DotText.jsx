import React, { memo } from 'react';
import DotChar from './DotChar';
import './DotText.css';

function getScale(length) {
  if (length > 25) return 0.6;
  if (length > 18) return 0.75;
  if (length > 12) return 0.85;
  return 1;
}

/**
 * DotText — renders a full string using the dot-matrix font.
 * Memoized: only re-renders when props change.
 * Supports auto-scaling length adjustments.
 */
const DotText = memo(function DotText({
  text = '',
  dotSize = 6,
  gap = 10,
  letterGap = 8,
  color = '#ffffff',
  glowColor,        // kept for API compat, color is passed to DotChar
  glowBlur = 3,
  offOpacity = 0.07,
  animated = true,
  pulse = false,
  scale,
  className = '',
  label,
  style = {},
}) {
  const chars = text.split('');
  const computedScale = scale !== undefined ? scale : getScale(text.length);

  const actualDotSize = dotSize * computedScale;
  const actualGap = gap * computedScale;
  const actualLetterGap = letterGap * computedScale;
  const actualGlowBlur = glowBlur * computedScale;

  return (
    <div className={`dot-text-container ${className}`} style={{ ...style }} aria-label={label || text} role="img">
      <span
        className={`dot-text ${pulse ? 'dot-text--pulse' : ''}`}
        style={{ '--letter-gap': `${actualLetterGap}px` }}
        aria-hidden="true"
      >
        {chars.map((ch, i) => (
          <DotChar
            key={i}
            char={ch}
            dotSize={actualDotSize}
            gap={actualGap}
            color={color}
            glowBlur={actualGlowBlur}
            offOpacity={offOpacity}
            animated={animated}
            animDelay={i}
          />
        ))}
      </span>
    </div>
  );
});

export default DotText;

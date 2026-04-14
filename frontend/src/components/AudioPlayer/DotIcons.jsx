import React from 'react';

const r = 2; // radius of each dot
const s = 6; // spacing
const s_x = 5.5; // horizontal spacing

const Dot = ({cx, cy}) => <circle cx={cx} cy={cy} r={r} fill="currentColor" />;

// Triangle pointing right
const TriangleRight = ({ ox=0, oy=0 }) => (
  <>
    {/* Column 1 (4 dots) */}
    <Dot cx={ox} cy={oy} />
    <Dot cx={ox} cy={oy + s} />
    <Dot cx={ox} cy={oy + s*2} />
    <Dot cx={ox} cy={oy + s*3} />

    {/* Column 2 (3 dots) */}
    <Dot cx={ox + s_x} cy={oy + s*0.5} />
    <Dot cx={ox + s_x} cy={oy + s*1.5} />
    <Dot cx={ox + s_x} cy={oy + s*2.5} />

    {/* Column 3 (2 dots) */}
    <Dot cx={ox + s_x*2} cy={oy + s*1} />
    <Dot cx={ox + s_x*2} cy={oy + s*2} />

    {/* Column 4 (1 dot) */}
    <Dot cx={ox + s_x*3} cy={oy + s*1.5} />
  </>
);

// Triangle pointing left
const TriangleLeft = ({ ox=0, oy=0 }) => (
  <>
    {/* Column 1 (1 dot) */}
    <Dot cx={ox} cy={oy + s*1.5} />
    
    {/* Column 2 (2 dots) */}
    <Dot cx={ox + s_x} cy={oy + s*1} />
    <Dot cx={ox + s_x} cy={oy + s*2} />

    {/* Column 3 (3 dots) */}
    <Dot cx={ox + s_x*2} cy={oy + s*0.5} />
    <Dot cx={ox + s_x*2} cy={oy + s*1.5} />
    <Dot cx={ox + s_x*2} cy={oy + s*2.5} />

    {/* Column 4 (4 dots) */}
    <Dot cx={ox + s_x*3} cy={oy} />
    <Dot cx={ox + s_x*3} cy={oy + s} />
    <Dot cx={ox + s_x*3} cy={oy + s*2} />
    <Dot cx={ox + s_x*3} cy={oy + s*3} />
  </>
);

// Vertical Bar (2 columns of 4 dots)
const VerticalBar = ({ ox=0, oy=0 }) => (
  <>
    <Dot cx={ox} cy={oy} />
    <Dot cx={ox} cy={oy + s} />
    <Dot cx={ox} cy={oy + s*2} />
    <Dot cx={ox} cy={oy + s*3} />

    <Dot cx={ox + s_x} cy={oy} />
    <Dot cx={ox + s_x} cy={oy + s} />
    <Dot cx={ox + s_x} cy={oy + s*2} />
    <Dot cx={ox + s_x} cy={oy + s*3} />
  </>
);

export const DotIconPlay = ({ size=44, color="#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill={color}>
    <g transform="translate(6, 7)">
      <TriangleRight ox={0} oy={0} />
    </g>
  </svg>
);

export const DotIconPause = ({ size=44, color="#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill={color}>
    <g transform="translate(6, 7)">
      <VerticalBar ox={0} oy={0} />
      {/* Shortened gap between bars */}
      <VerticalBar ox={s_x * 2.5} oy={0} />
    </g>
  </svg>
);

export const DotIconPrevious = ({ size=36, color="#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill={color}>
    <g transform="translate(6, 7)">
      {/* Vertical bar on the left */}
      <Dot cx={-s_x} cy={0} />
      <Dot cx={-s_x} cy={s} />
      <Dot cx={-s_x} cy={s*2} />
      <Dot cx={-s_x} cy={s*3} />
      <TriangleLeft ox={0} oy={0} />
    </g>
  </svg>
);

export const DotIconNext = ({ size=36, color="#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill={color}>
    <g transform="translate(6, 7)">
      <TriangleRight ox={0} oy={0} />
      {/* Vertical bar on the right */}
      <Dot cx={s_x*4} cy={0} />
      <Dot cx={s_x*4} cy={s} />
      <Dot cx={s_x*4} cy={s*2} />
      <Dot cx={s_x*4} cy={s*3} />
    </g>
  </svg>
);

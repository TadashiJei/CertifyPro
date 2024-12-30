import React, { memo } from 'react';

interface ElementOverlayProps {
  width: number;
  height: number;
  x: number;
  y: number;
}

export const ElementOverlay = memo(({ width, height, x, y }: ElementOverlayProps) => {
  return (
    <div
      className="absolute bg-primary/10 text-xs text-primary-foreground px-2 py-0.5 rounded-md shadow-sm pointer-events-none"
      style={{
        top: `${y - 24}px`,
        left: `${x}px`,
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        zIndex: 50,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      {Math.round(width)}px, {Math.round(height)}px
    </div>
  );
});

import React, { useState, useEffect, useRef, memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface ResizableElementProps {
  id: string;
  width: number;
  height: number;
  children: React.ReactNode;
  onResize: (size: { width: number; height: number }) => void;
  style?: React.CSSProperties;
  className?: string;
}

export const ResizableElement = memo(({
  id,
  width,
  height,
  children,
  onResize,
  style,
  className,
}: ResizableElementProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });
  
  const elementRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width, height });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeHandle(handle);
    setInitialSize({ width, height });
    setInitialMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;
    requestAnimationFrame(() => {
      const deltaX = e.clientX - initialMousePos.x;
      const deltaY = e.clientY - initialMousePos.y;
      let newWidth = initialSize.width;
      let newHeight = initialSize.height;

      switch (resizeHandle) {
        case 'e':
          newWidth = Math.max(50, initialSize.width + deltaX);
          break;
        case 'w':
          newWidth = Math.max(50, initialSize.width - deltaX);
          break;
        case 's':
          newHeight = Math.max(50, initialSize.height + deltaY);
          break;
        case 'n':
          newHeight = Math.max(50, initialSize.height - deltaY);
          break;
        case 'se':
          newWidth = Math.max(50, initialSize.width + deltaX);
          newHeight = Math.max(50, initialSize.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(50, initialSize.width - deltaX);
          newHeight = Math.max(50, initialSize.height + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(50, initialSize.width + deltaX);
          newHeight = Math.max(50, initialSize.height - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(50, initialSize.width - deltaX);
          newHeight = Math.max(50, initialSize.height - deltaY);
          break;
      }

      onResize({ width: newWidth, height: newHeight });
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeHandle(null);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, initialSize, initialMousePos, resizeHandle]);

  const resizeHandles = [
    { position: 'nw', cursor: 'nw-resize', style: { top: -5, left: -5 } },
    { position: 'n', cursor: 'n-resize', style: { top: -5, left: '50%' } },
    { position: 'ne', cursor: 'ne-resize', style: { top: -5, right: -5 } },
    { position: 'w', cursor: 'w-resize', style: { top: '50%', left: -5 } },
    { position: 'e', cursor: 'e-resize', style: { top: '50%', right: -5 } },
    { position: 'sw', cursor: 'sw-resize', style: { bottom: -5, left: -5 } },
    { position: 's', cursor: 's-resize', style: { bottom: -5, left: '50%' } },
    { position: 'se', cursor: 'se-resize', style: { bottom: -5, right: -5 } },
  ];

  const combinedStyle = {
    ...style,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute',
    left: style?.left,
    top: style?.top,
    cursor: isResizing ? 'move' : undefined,
    opacity: isDragging ? 0.8 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: 'box-shadow 0.2s, opacity 0.2s',
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : 'none',
    willChange: 'transform',
    transformOrigin: 'center center',
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (elementRef.current) elementRef.current = node;
      }}
      {...(!isResizing ? { ...attributes, ...listeners } : {})}
      className={`absolute ${className || ''} ${isDragging ? 'z-50' : ''}`}
      style={combinedStyle}
    >
      {/* Position indicator */}
      {isDragging && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 rounded">
          {Math.round(Number(style?.left))}px, {Math.round(Number(style?.top))}px
        </div>
      )}

      {/* Resize handles */}
      {resizeHandles.map(({ position, cursor, style: handleStyle }) => (
        <div
          key={position}
          onMouseDown={(e) => handleResizeStart(e, position)}
          className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            ...handleStyle,
            cursor,
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        />
      ))}

      {/* Content */}
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
});

ResizableElement.displayName = 'ResizableElement';

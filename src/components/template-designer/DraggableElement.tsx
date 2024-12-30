import React, { useRef, useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface DraggableElementProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export const DraggableElement = ({ 
  id, 
  children, 
  className,
  style,
  onMouseEnter,
  onMouseLeave,
}: DraggableElementProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const elementRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (elementRef.current) {
      const { width, height } = elementRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  const elementStyle = transform ? {
    transform: CSS.Translate.toString(transform),
    width: dimensions.width || style?.width,
    height: dimensions.height || style?.height,
    ...style,
  } : {
    width: dimensions.width || style?.width,
    height: dimensions.height || style?.height,
    ...style,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (elementRef) elementRef.current = node;
      }}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-move select-none',
        className
      )}
      style={elementStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};

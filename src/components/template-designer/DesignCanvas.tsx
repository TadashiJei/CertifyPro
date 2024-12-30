import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, RotateCcw, Grid, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ElementOverlay } from './ElementOverlay';
import { CanvasContextMenu } from './ContextMenu';
import { Trash2, Copy } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ElementSize, TemplateElement, ElementType } from '@/types/template';

type Unit = 'px' | 'in' | 'cm' | 'mm';

const UNIT_CONVERSIONS = {
  px: { px: 1, in: 1/96, cm: 2.54/96, mm: 25.4/96 },
  in: { px: 96, in: 1, cm: 2.54, mm: 25.4 },
  cm: { px: 96/2.54, in: 1/2.54, cm: 1, mm: 10 },
  mm: { px: 96/25.4, in: 1/25.4, cm: 0.1, mm: 1 }
};

const PRESET_SIZES = [
  { name: 'A4', width: 210, height: 297, unit: 'mm' },
  { name: 'A5', width: 148, height: 210, unit: 'mm' },
  { name: 'Letter', width: 8.5, height: 11, unit: 'in' },
  { name: 'Legal', width: 8.5, height: 14, unit: 'in' },
  { name: 'Instagram Post', width: 1080, height: 1080, unit: 'px' },
  { name: 'Facebook Cover', width: 851, height: 315, unit: 'px' },
];

interface DesignCanvasProps {
  children: React.ReactNode;
  dimensions: ElementSize;
  setDimensions: (dimensions: ElementSize) => void;
  onBack: () => void;
  onDeleteElement: (id: string) => void;
  onAddElement: (type: ElementType, position: { x: number; y: number }) => void;
  selectedElement: TemplateElement | null;
  onElementSelect: (element: TemplateElement | null) => void;
  className?: string;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  children,
  dimensions,
  setDimensions,
  onBack,
  onDeleteElement,
  onAddElement,
  selectedElement,
  onElementSelect,
  className,
}) => {
  const { setNodeRef } = useDroppable({ id: 'design-canvas' });
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [unit, setUnit] = useState<Unit>('px');
  const [displayDimensions, setDisplayDimensions] = useState<ElementSize>({
    width: dimensions.width,
    height: dimensions.height,
  });
  const [activeElement, setActiveElement] = useState<string | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    // Handle mouse move logic
    if (activeElement) {
      // Update element position
      setActiveElement(prev => ({
        ...prev,
        x,
        y,
      }));
    }
  }, [zoom, activeElement]);

  const handleElementOver = useCallback((elementId: string) => {
    setActiveElement(elementId);
  }, []);

  const handleElementOut = useCallback(() => {
    setActiveElement(null);
  }, []);

  const handlePresetSelect = useCallback((preset: typeof PRESET_SIZES[number]) => {
    const width = UNIT_CONVERSIONS[preset.unit][unit] * preset.width;
    const height = UNIT_CONVERSIONS[preset.unit][unit] * preset.height;
    setDimensions({ width: Math.round(width), height: Math.round(height) });
    setUnit(preset.unit);
    setDisplayDimensions({ width: preset.width, height: preset.height });
  }, [unit]);

  const handleSizeChange = useCallback((dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setDisplayDimensions(prev => ({
        ...prev,
        [dimension]: numValue,
      }));
      const pixelValue = UNIT_CONVERSIONS[unit][unit] * numValue;
      setDimensions({
        width: dimension === 'width' ? Math.round(pixelValue) : dimensions.width,
        height: dimension === 'height' ? Math.round(pixelValue) : dimensions.height
      });
    }
  }, [unit, dimensions]);

  const handleUnitChange = useCallback((newUnit: Unit) => {
    setUnit(newUnit);
    // Convert dimensions to new unit
    const width = UNIT_CONVERSIONS[unit][newUnit] * displayDimensions.width;
    const height = UNIT_CONVERSIONS[unit][newUnit] * displayDimensions.height;
    setDisplayDimensions({ width, height });
  }, [unit, displayDimensions]);

  // Calculate zoom and update dimensions
  useEffect(() => {
    const updateZoom = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scale = Math.min(
        rect.width / displayDimensions.width,
        rect.height / displayDimensions.height,
        1
      );
      setZoom(scale);
    };

    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, [displayDimensions]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          {/* Preset Sizes */}
          <Select onValueChange={(value) => {
            const preset = PRESET_SIZES.find(p => p.name === value);
            if (preset) handlePresetSelect(preset);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Choose size..." />
            </SelectTrigger>
            <SelectContent>
              {PRESET_SIZES.map((size) => (
                <SelectItem key={size.name} value={size.name}>
                  {size.name} ({size.width}x{size.height}{size.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6">
          {/* Size Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Width</Label>
              <Input
                type="number"
                value={displayDimensions.width}
                onChange={(e) => handleSizeChange('width', e.target.value)}
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>Height</Label>
              <Input
                type="number"
                value={displayDimensions.height}
                onChange={(e) => handleSizeChange('height', e.target.value)}
                className="w-20"
              />
            </div>
            <Select value={unit} onValueChange={(value: Unit) => handleUnitChange(value)}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="px">px</SelectItem>
                <SelectItem value="in">in</SelectItem>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="mm">mm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid Toggle */}
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            <Switch
              checked={showGrid}
              onCheckedChange={setShowGrid}
              aria-label="Toggle grid"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(1)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 overflow-auto p-4 bg-gray-100">
        <div 
          className="min-h-full flex items-center justify-center"
          style={{ 
            minHeight: 'calc(100vh - 150px)',  // Account for header height
          }}
        >
          <CanvasContextMenu
            onAddElement={onAddElement || (() => {})}
            onDeleteElement={selectedElement ? () => onDeleteElement?.(selectedElement.id) : undefined}
            onDuplicateElement={() => {
              // TODO: Implement duplicate functionality
              console.log('Duplicate element:', selectedElement?.id);
            }}
            hasSelectedElement={!!selectedElement}
          >
            <div 
              className="relative" 
              style={{ 
                transform: `scale(${zoom})`, 
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out'
              }}
            >
              <div
                ref={(node) => {
                  setNodeRef(node);
                  if (containerRef) containerRef.current = node;
                }}
                className={cn(
                  "relative bg-white shadow-lg mx-auto",
                  className
                )}
                style={{
                  width: `${dimensions.width}px`,
                  height: `${dimensions.height}px`,
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 200px)', // Prevent overflow
                }}
                onMouseMove={handleMouseMove}
              >
                {showGrid && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Grid lines */}
                    {Array.from({ length: Math.floor(dimensions.width / 20) }).map((_, i) => (
                      <line
                        key={`v-${i}`}
                        x1={i * 20}
                        y1={0}
                        x2={i * 20}
                        y2={dimensions.height}
                        stroke="#ddd"
                        strokeWidth={0.5}
                      />
                    ))}
                    {Array.from({ length: Math.floor(dimensions.height / 20) }).map((_, i) => (
                      <line
                        key={`h-${i}`}
                        x1={0}
                        y1={i * 20}
                        x2={dimensions.width}
                        y2={i * 20}
                        stroke="#ddd"
                        strokeWidth={0.5}
                      />
                    ))}
                  </svg>
                )}

                {/* Content */}
                <div className="absolute inset-0">
                  {React.Children.map(children, (child) => {
                    if (!React.isValidElement(child)) return child;
                    
                    const elementProps = child.props;
                    const elementId = elementProps.id;
                    const elementDimensions = {
                      width: elementProps.width || 0,
                      height: elementProps.height || 0,
                    };
                    const isSelected = selectedElement?.id === elementId;

                    return React.cloneElement(child, {
                      ...elementProps,
                      onMouseEnter: (e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleElementOver(e, elementId, elementDimensions);
                        if (elementProps.onMouseEnter) elementProps.onMouseEnter(e);
                      },
                      onMouseLeave: (e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleElementOut(elementId);
                        if (elementProps.onMouseLeave) elementProps.onMouseLeave(e);
                      },
                      onClick: (e: React.MouseEvent) => {
                        e.stopPropagation();
                        onElementSelect?.(elementProps);
                        if (elementProps.onClick) elementProps.onClick(e);
                      },
                      style: {
                        ...elementProps.style,
                        position: 'absolute',
                        transform: elementProps.style?.transform || 'none',
                        left: elementProps.style?.left || 0,
                        top: elementProps.style?.top || 0,
                      },
                      className: cn(elementProps.className, isSelected ? 'ring-2 ring-primary' : ''),
                    });
                  })}
                </div>

                {/* Dimension Overlay */}
                {activeElement && (
                  <ElementOverlay 
                    width={dimensions.width}
                    height={dimensions.height}
                    x={0}
                    y={0}
                  />
                )}

                {/* Selected Element Controls */}
                {selectedElement && (
                  <div 
                    className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background shadow-lg rounded-lg px-2 py-1"
                    style={{ zIndex: 100 }}
                  >
                    <button
                      onClick={() => onDeleteElement?.(selectedElement.id)}
                      className="p-1 hover:bg-destructive/10 rounded-sm text-destructive"
                      title="Delete Element"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement duplicate
                        console.log('Duplicate:', selectedElement.id);
                      }}
                      className="p-1 hover:bg-muted rounded-sm"
                      title="Duplicate Element"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CanvasContextMenu>
        </div>
      </div>
    </div>
  );
};

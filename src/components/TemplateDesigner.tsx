import React, { useState, useEffect, CSSProperties } from 'react';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, Settings, Save, Loader2, LayoutGrid, LayoutTemplate } from 'lucide-react';
import { ResizableElement } from './template-designer/ResizableElement';
import { ElementToolbar } from './template-designer/ElementToolbar';
import { DesignCanvas } from './template-designer/DesignCanvas';
import { ImageUploader } from './template-designer/ImageUploader';
import {
  TemplateElement,
  ElementType,
  ElementPosition,
  ElementSize,
  ElementStyle,
  Template,
  TemplateError,
  TemplateValidationError,
  DEFAULT_ELEMENT_SIZES,
  DEFAULT_ELEMENT_STYLES,
  DEFAULT_TEMPLATE_DIMENSIONS,
} from '@/types/template';

interface TemplateDesignerProps {
  user: User;
  templateId?: string;
}

const TemplateDesigner: React.FC<TemplateDesignerProps> = () => {
  const { user } = useAuth();
  const { templateId } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [draggingElement, setDraggingElement] = useState<TemplateElement | null>(null);
  const [dimensions, setDimensions] = useState<ElementSize>({
    width: 210,
    height: 297,
  });
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Default variable types
  const defaultVariableTypes: Record<string, string[]> = {
    recipient: ['name', 'email', 'id', 'date'],
    certificate: ['title', 'description', 'issueDate', 'expiryDate'],
    issuer: ['name', 'organization', 'signature', 'logo']
  };

  const [variableTypes, setVariableTypes] = useState<Record<string, string[]>>(defaultVariableTypes);

  const handleBack = () => {
    if (saving) return;
    navigate('/dashboard', { replace: true });
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/login', { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return;

      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('id', templateId)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name || '');
          setDescription(data.description || '');
          const designData = JSON.parse(data.design_data || '{}');
          if (designData.dimensions) {
            setDimensions(designData.dimensions);
          }
          setOrientation(designData?.orientation || 'landscape');
          setElements(designData?.elements || []);
        }
      } catch (error) {
        console.error('Error loading template:', error);
        toast({
          title: 'Error',
          description: 'Failed to load template',
          variant: 'destructive',
        });
      }
    };

    loadTemplate();
  }, [templateId, toast]);

  const addElement = (type: ElementType) => {
    try {
      const newElement: TemplateElement = {
        id: nanoid(),
        type,
        content: type === 'text' ? 'New Text' : '',
        position: { x: dimensions.width / 4, y: dimensions.height / 4 },
        size: { ...DEFAULT_ELEMENT_SIZES[type] },
        style: { ...DEFAULT_ELEMENT_STYLES[type] },
        zIndex: elements.length,
      };

      setElements(prev => [...prev, newElement]);
      setSelectedElement(newElement);

      if (type === 'image') {
        setShowImageUploader(true);
      }
    } catch (error) {
      console.error('Error adding element:', error);
      toast({
        title: 'Error',
        description: 'Failed to add element',
        variant: 'destructive',
      });
    }
  };

  const updateElement = (id: string, updates: Partial<TemplateElement>) => {
    try {
      setElements((prevElements) => {
        const elementIndex = prevElements.findIndex((e) => e.id === id);
        if (elementIndex === -1) {
          console.warn(`Element with id ${id} not found`);
          return prevElements;
        }

        const prevElement = prevElements[elementIndex];
        const updatedElement = {
          ...prevElement,
          ...updates,
          position: updates.position || prevElement.position,
          size: updates.size || prevElement.size,
          style: {
            ...prevElement.style,
            ...(updates.style || {}),
          },
          content: updates.content !== undefined ? updates.content : prevElement.content,
          variableType: updates.variableType || prevElement.variableType,
        };

        const newElements = [...prevElements];
        newElements[elementIndex] = updatedElement;

        // Update selected element if it's the one being modified
        if (selectedElement?.id === id) {
          setSelectedElement(updatedElement);
        }

        return newElements;
      });
    } catch (error) {
      console.error('Error updating element:', error);
      toast({
        title: 'Error',
        description: 'Failed to update element',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (url: string) => {
    if (selectedElement && selectedElement.type === 'image') {
      updateElement(selectedElement.id, { content: url });
      setShowImageUploader(false);
    }
  };

  const removeElement = (id: string) => {
    setElements((prevElements) => {
      const elementIndex = prevElements.findIndex((e) => e.id === id);
      if (elementIndex === -1) {
        return prevElements;
      }
      const newElements = prevElements.filter((e) => e.id !== id);
      return newElements;
    });
    setSelectedElement(null);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const template: Template = {
        id: templateId || nanoid(),
        name: name || 'Untitled Template',
        description,
        user_id: user.id,
        is_public: false,
        design_data: JSON.stringify({
          dimensions,
          orientation,
          elements,
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('templates')
        .upsert(template);

      if (error) {
        throw new TemplateValidationError('Failed to save template', [{
          code: 'SAVE_ERROR',
          message: error.message,
        }]);
      }

      toast({
        title: 'Template saved successfully',
        description: 'Your template has been saved to your account.',
      });

      if (!templateId) {
        navigate(`/templates/${template.id}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      
      if (error instanceof TemplateValidationError) {
        error.errors.forEach(err => {
          toast({
            title: 'Validation Error',
            description: err.message,
            variant: 'destructive',
          });
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save template',
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active) return;

    const id = active.id as string;
    const element = elements.find((e) => e.id === id);
    if (!element) return;

    const newPosition = {
      x: element.position.x + delta.x,
      y: element.position.y + delta.y,
    };

    updateElement(id, { position: newPosition });
    setDraggingElement(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedElement = elements.find(el => el.id === active.id);
    if (draggedElement) {
      setDraggingElement(draggedElement);
      setSelectedElement(draggedElement);
    }
  };

  const renderElement = (element: TemplateElement) => {
    const { key, ...commonProps } = {
      key: element.id,
      id: element.id,
      width: element.size?.width || DEFAULT_ELEMENT_SIZES[element.type].width,
      height: element.size?.height || DEFAULT_ELEMENT_SIZES[element.type].height,
      onResize: (size: { width: number; height: number }) => {
        updateElement(element.id, { size });
      },
      style: {
        left: element.position.x,
        top: element.position.y,
        ...element.style,
      },
      className: `group ${selectedElement?.id === element.id ? 'ring-2 ring-primary' : ''}`,
    };

    const getElementContent = () => {
      switch (element.type) {
        case 'image':
          return (
            <img 
              src={element.content} 
              alt="Template element" 
              className="max-w-full max-h-full w-auto h-auto object-contain"
              style={{ 
                imageRendering: 'high-quality',
                pointerEvents: 'none'
              }}
              draggable={false}
            />
          );
        case 'qr':
          return (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-3/4 h-3/4 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">QR Code</span>
              </div>
            </div>
          );
        case 'variable':
          return (
            <div
              className="w-full h-full flex items-center justify-center text-center"
              style={{
                fontSize: element.style?.fontSize || '14px',
                color: element.style?.color || '#4b5563',
                backgroundColor: element.style?.backgroundColor || '#f3f4f6',
                border: element.style?.border || '1px solid #e2e8f0',
                borderRadius: element.style?.borderRadius || '4px',
                padding: element.style?.padding || '4px 8px',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              {element.content}
            </div>
          );
        default: // text
          return (
            <div
              className="w-full h-full flex items-center justify-center text-center"
              style={{
                ...element.style,
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              {element.content}
            </div>
          );
      }
    };

    return (
      <ResizableElement
        key={element.id}
        {...commonProps}
      >
        <div 
          className="w-full h-full flex items-center justify-center cursor-move relative"
          onClick={() => setSelectedElement(element)}
        >
          {getElementContent()}
          {selectedElement?.id === element.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeElement(element.id);
              }}
              className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs hover:bg-destructive/90 shadow-sm"
            >
              ×
            </button>
          )}
        </div>
      </ResizableElement>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-white">
        <ElementToolbar 
          onAddElement={addElement}
          selectedElement={selectedElement}
          onUpdateElement={updateElement}
          variableTypes={variableTypes}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Template Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-64 bg-white border-slate-200"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-slate-200">
                    <Settings className="w-4 h-4 mr-1" />
                    Template Settings
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Enter template description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 bg-white border-slate-200"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Orientation</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          variant={orientation === 'landscape' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOrientation('landscape')}
                          className={orientation === 'landscape' ? '' : 'border-slate-200'}
                        >
                          <LayoutGrid className="w-4 h-4 mr-1" />
                          Landscape
                        </Button>
                        <Button
                          variant={orientation === 'portrait' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOrientation('portrait')}
                          className={orientation === 'portrait' ? '' : 'border-slate-200'}
                        >
                          <LayoutTemplate className="w-4 h-4 mr-1" />
                          Portrait
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Select
                value={dimensions.unit}
                onValueChange={(value) => setDimensions({ ...dimensions, unit: value })}
              >
                <SelectTrigger className="w-24 bg-white border-slate-200">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="px">Pixels</SelectItem>
                  <SelectItem value="mm">Millimeters</SelectItem>
                  <SelectItem value="cm">Centimeters</SelectItem>
                  <SelectItem value="in">Inches</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={dimensions.width}
                onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                className="w-20 bg-white border-slate-200"
              />
              <span className="text-slate-500">×</span>
              <Input
                type="number"
                value={dimensions.height}
                onChange={(e) => setDimensions({ ...dimensions, height: Number(e.target.value) })}
                className="w-20 bg-white border-slate-200"
              />
            </div>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="min-w-[100px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-auto">
          <DndContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <DesignCanvas
              dimensions={{ width: dimensions.width, height: dimensions.height }}
              setDimensions={(newDimensions) => {
                setDimensions({ ...dimensions, ...newDimensions });
              }}
              onBack={handleBack}
              onDeleteElement={removeElement}
              onAddElement={addElement}
              selectedElement={selectedElement}
              onElementSelect={setSelectedElement}
            >
              {elements.map((element) => (
                <ResizableElement
                  key={element.id}
                  id={element.id}
                  width={element.size?.width || DEFAULT_ELEMENT_SIZES[element.type].width}
                  height={element.size?.height || DEFAULT_ELEMENT_SIZES[element.type].height}
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    ...element.style,
                    textAlign: element.style?.textAlign as CSSProperties['textAlign']
                  }}
                  onResize={(size) => updateElement(element.id, { size })}
                  className={selectedElement?.id === element.id ? 'ring-2 ring-primary' : ''}
                >
                  {renderElement(element)}
                </ResizableElement>
              ))}
            </DesignCanvas>
          </DndContext>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      {selectedElement && (
        <div className="w-64 border-l bg-white overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium mb-4">Element Properties</h3>
            <div className="space-y-4">
              {selectedElement.type === 'text' && (
                <>
                  <div>
                    <Label>Text Content</Label>
                    <Input
                      value={selectedElement.content}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Font Size</Label>
                    <Input
                      type="number"
                      value={typeof selectedElement.style?.fontSize === 'string' 
                        ? parseInt(selectedElement.style.fontSize) 
                        : selectedElement.style?.fontSize || 16}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, fontSize: Number(e.target.value) }
                      })}
                      className="mt-1"
                      min={8}
                      max={72}
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>X Position</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedElement.position.x)}
                    onChange={(e) => updateElement(selectedElement.id, {
                      position: { ...selectedElement.position, x: Number(e.target.value) }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Y Position</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedElement.position.y)}
                    onChange={(e) => updateElement(selectedElement.id, {
                      position: { ...selectedElement.position, y: Number(e.target.value) }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variable Dialog */}
      <Dialog open={showImageUploader} onOpenChange={setShowImageUploader}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Upload an image to add to your template
            </DialogDescription>
          </DialogHeader>
          <ImageUploader onUploadComplete={handleImageUpload} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateDesigner;

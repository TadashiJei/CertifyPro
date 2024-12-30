import React from 'react';
import { Button } from '@/components/ui/button';
import { FontSelector } from './FontSelector';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Image, 
  Type, 
  Variable, 
  QrCode,
  Plus
} from 'lucide-react';

interface ElementToolbarProps {
  onAddElement: (type: string) => void;
  selectedElement: any;
  onUpdateElement: (updates: any) => void;
  variableTypes: Record<string, string[]>;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  onAddElement,
  selectedElement,
  onUpdateElement,
  variableTypes = {}, // Provide default empty object
}) => {
  const updateStyle = (key: string, value: string | number) => {
    onUpdateElement({
      style: {
        ...selectedElement?.style,
        [key]: value,
      },
    });
  };

  const tools = [
    {
      id: 'text',
      label: 'Add Text',
      icon: Type,
      onClick: () => onAddElement('text')
    },
    {
      id: 'image',
      label: 'Add Image',
      icon: Image,
      onClick: () => onAddElement('image')
    },
    {
      id: 'variable',
      label: 'Add Variable',
      icon: Variable,
      onClick: () => onAddElement('variable')
    },
    {
      id: 'qr',
      label: 'Add QR Code',
      icon: QrCode,
      onClick: () => onAddElement('qr')
    }
  ];

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="p-4 space-y-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant="ghost"
            className="w-full justify-start gap-2 h-12 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
            onClick={tool.onClick}
          >
            <tool.icon className="w-5 h-5 text-slate-500" />
            <span>{tool.label}</span>
          </Button>
        ))}
      </div>

      {selectedElement && (
        <div className="space-y-4 p-4 border-t">
          {/* Text Element Controls */}
          {selectedElement.type === 'text' && (
            <div className="space-y-4">
              <Textarea
                value={selectedElement.content}
                onChange={(e) => onUpdateElement({ content: e.target.value })}
                placeholder="Enter text content"
                className="min-h-[100px]"
              />
              
              <div className="flex flex-wrap gap-2 items-center">
                <FontSelector
                  value={selectedElement.style?.fontFamily || 'Arial'}
                  onChange={(value) => updateStyle('fontFamily', value)}
                />
                
                <Input
                  type="number"
                  value={selectedElement.style?.fontSize || 16}
                  onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                  className="w-20"
                />

                <div className="flex gap-1">
                  <Button
                    variant={selectedElement.style?.fontWeight === 'bold' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => updateStyle('fontWeight', selectedElement.style?.fontWeight === 'bold' ? 'normal' : 'bold')}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant={selectedElement.style?.fontStyle === 'italic' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => updateStyle('fontStyle', selectedElement.style?.fontStyle === 'italic' ? 'normal' : 'italic')}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant={selectedElement.style?.textAlign === 'left' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => updateStyle('textAlign', 'left')}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant={selectedElement.style?.textAlign === 'center' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => updateStyle('textAlign', 'center')}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant={selectedElement.style?.textAlign === 'right' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => updateStyle('textAlign', 'right')}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>

                <Input
                  type="color"
                  value={selectedElement.style?.color || '#000000'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-10 h-10 p-1"
                />
              </div>
            </div>
          )}

          {/* Variable Element Controls */}
          {selectedElement.type === 'variable' && (
            <div className="space-y-4">
              <Tabs defaultValue={Object.keys(variableTypes)[0] || 'recipient'}>
                <TabsList className="w-full">
                  {Object.keys(variableTypes).map((type) => (
                    <TabsTrigger key={type} value={type} className="flex-1 capitalize">
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(variableTypes).map(([type, variables]) => (
                  <TabsContent key={type} value={type}>
                    <Select
                      value={selectedElement.content}
                      onValueChange={(value) => onUpdateElement({ content: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${type} variable`} />
                      </SelectTrigger>
                      <SelectContent>
                        {variables.map((variable) => (
                          <SelectItem key={variable} value={`{{${type}.${variable}}}`}>
                            {variable}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="space-y-2">
                <Label>Appearance</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    type="number"
                    value={selectedElement.style?.fontSize || 16}
                    onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                    className="w-20"
                  />
                  <Input
                    type="color"
                    value={selectedElement.style?.color || '#000000'}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="w-10 h-10 p-1"
                  />
                  <Input
                    type="color"
                    value={selectedElement.style?.backgroundColor || '#f0f9ff'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="w-10 h-10 p-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

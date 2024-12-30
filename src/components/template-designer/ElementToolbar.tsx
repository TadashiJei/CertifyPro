import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FontSelector } from './FontSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import { TemplateElement } from '@/types/template';

interface ElementToolbarProps {
  onAddElement: (type: string) => void;
  selectedElement: TemplateElement | null;
  onUpdateElement: (id: string, updates: Partial<TemplateElement>) => void;
  variableTypes: Record<string, string[]>;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  onAddElement,
  selectedElement,
  onUpdateElement,
  variableTypes = {}, // Provide default empty object
}) => {
  const [showVariableDialog, setShowVariableDialog] = useState(false);

  const updateStyle = (key: string, value: string | number) => {
    if (!selectedElement) return;
    
    onUpdateElement(selectedElement.id, {
      style: {
        ...selectedElement.style,
        [key]: value,
      },
    });
  };

  const updateContent = (content: string) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, { content });
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
      onClick: () => {
        onAddElement('variable');
        setShowVariableDialog(true);
      }
    },
    {
      id: 'qr',
      label: 'Add QR Code',
      icon: QrCode,
      onClick: () => onAddElement('qr')
    }
  ];

  if (!selectedElement) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant="outline"
              size="sm"
              onClick={tool.onClick}
            >
              <tool.icon className="w-4 h-4 mr-2" />
              {tool.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {selectedElement.type === 'text' && (
        <>
          <div>
            <Label>Text Content</Label>
            <Textarea
              value={selectedElement.content || ''}
              onChange={(e) => updateContent(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Font Family</Label>
            <FontSelector
              value={selectedElement.style?.fontFamily || 'Arial'}
              onChange={(value) => updateStyle('fontFamily', value)}
            />
          </div>
          <div>
            <Label>Font Size</Label>
            <Input
              type="number"
              value={selectedElement.style?.fontSize || 16}
              onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
              className="mt-1"
              min={8}
              max={72}
            />
          </div>
          <div className="flex gap-2">
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
        </>
      )}

      {selectedElement.type === 'variable' && (
        <>
          <Button 
            variant="outline" 
            onClick={() => setShowVariableDialog(true)}
            className="w-full"
          >
            {selectedElement.content || 'Select Variable'}
          </Button>

          <Dialog open={showVariableDialog} onOpenChange={setShowVariableDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Select Variable</DialogTitle>
                <DialogDescription>
                  Choose a variable to insert into your template
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <Tabs defaultValue={Object.keys(variableTypes)[0] || 'recipient'}>
                  <TabsList className="w-full">
                    {Object.keys(variableTypes).length > 0 ? (
                      Object.keys(variableTypes).map((type) => (
                        <TabsTrigger 
                          key={type} 
                          value={type}
                          className="flex-1"
                        >
                          {type}
                        </TabsTrigger>
                      ))
                    ) : (
                      <TabsTrigger value="recipient" className="flex-1">Recipient</TabsTrigger>
                    )}
                  </TabsList>
                  {Object.keys(variableTypes).length > 0 ? (
                    Object.entries(variableTypes).map(([type, variables]) => (
                      <TabsContent key={type} value={type} className="mt-4">
                        <div className="grid grid-cols-2 gap-2">
                          {variables.map((variable) => (
                            <Button
                              key={variable}
                              variant="outline"
                              onClick={() => {
                                onUpdateElement(selectedElement.id, {
                                  content: `{{${type}.${variable}}}`,
                                  variableType: type
                                });
                                setShowVariableDialog(false);
                              }}
                              className="justify-start"
                            >
                              {variable}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    ))
                  ) : (
                    <TabsContent value="recipient" className="mt-4">
                      <div className="grid grid-cols-2 gap-2">
                        {['name', 'email', 'id', 'date'].map((variable) => (
                          <Button
                            key={variable}
                            variant="outline"
                            onClick={() => {
                              onUpdateElement(selectedElement.id, {
                                content: `{{recipient.${variable}}}`,
                                variableType: 'recipient'
                              });
                              setShowVariableDialog(false);
                            }}
                            className="justify-start"
                          >
                            {variable}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

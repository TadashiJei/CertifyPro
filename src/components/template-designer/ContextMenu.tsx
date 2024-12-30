import React from 'react';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  TextIcon, 
  ImageIcon, 
  VariableIcon, 
  QrCodeIcon,
  Trash2Icon,
  CopyIcon
} from 'lucide-react';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onAddElement: (type: 'text' | 'image' | 'variable' | 'qr') => void;
  onDeleteElement?: () => void;
  onDuplicateElement?: () => void;
  hasSelectedElement?: boolean;
}

export function CanvasContextMenu({
  children,
  onAddElement,
  onDeleteElement,
  onDuplicateElement,
  hasSelectedElement
}: CanvasContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {!hasSelectedElement ? (
          <>
            <ContextMenuItem onClick={() => onAddElement('text')}>
              <TextIcon className="w-4 h-4 mr-2" />
              Add Text
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddElement('image')}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Image
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddElement('variable')}>
              <VariableIcon className="w-4 h-4 mr-2" />
              Add Variable
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddElement('qr')}>
              <QrCodeIcon className="w-4 h-4 mr-2" />
              Add QR Code
            </ContextMenuItem>
          </>
        ) : (
          <>
            {onDuplicateElement && (
              <ContextMenuItem onClick={onDuplicateElement}>
                <CopyIcon className="w-4 h-4 mr-2" />
                Duplicate
              </ContextMenuItem>
            )}
            {onDeleteElement && (
              <ContextMenuItem onClick={onDeleteElement} className="text-red-600">
                <Trash2Icon className="w-4 h-4 mr-2" />
                Delete
              </ContextMenuItem>
            )}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

import { Json } from '@/types/supabase';

export type ElementType = 'text' | 'image' | 'variable' | 'qr';

export interface ElementSize {
  width: number;
  height: number;
}

export interface ElementPosition {
  x: number;
  y: number;
}

export interface ElementStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
  opacity?: number;
  transform?: string;
  filter?: string;
  boxShadow?: string;
}

export interface TemplateElement {
  id: string;
  type: ElementType;
  content: string;
  position: ElementPosition;
  size: ElementSize;
  style: ElementStyle;
  zIndex: number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  is_public: boolean;
  design_data: {
    dimensions: ElementSize;
    elements: TemplateElement[];
  };
  created_at?: string;
  updated_at?: string;
}

export interface TemplateError {
  code: string;
  message: string;
  field?: string;
}

export class TemplateValidationError extends Error {
  constructor(message: string, public errors: TemplateError[]) {
    super(message);
    this.name = 'TemplateValidationError';
  }
}

export const DEFAULT_ELEMENT_SIZES: Record<ElementType, ElementSize> = {
  text: { width: 200, height: 40 },
  image: { width: 200, height: 200 },
  variable: { width: 150, height: 30 },
  qr: { width: 100, height: 100 },
};

export const DEFAULT_ELEMENT_STYLES: Record<ElementType, ElementStyle> = {
  text: {
    color: '#000000',
    fontSize: '16px',
    fontFamily: 'Arial',
    textAlign: 'left',
    padding: '4px',
  },
  image: {
    borderRadius: '4px',
    padding: '4px',
  },
  variable: {
    color: '#1e40af',
    fontSize: '14px',
    fontFamily: 'monospace',
    backgroundColor: '#f8fafc',
    padding: '4px',
    borderRadius: '4px',
  },
  qr: {
    backgroundColor: '#ffffff',
    padding: '8px',
    borderRadius: '4px',
  },
};

export const DEFAULT_TEMPLATE_DIMENSIONS: ElementSize = {
  width: 595, // A4 width in pixels at 72 DPI
  height: 842, // A4 height in pixels at 72 DPI
};

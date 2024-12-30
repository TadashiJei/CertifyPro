import { Json } from './supabase';

export type ElementType = 'text' | 'image' | 'variable' | 'qr';

export interface ElementPosition {
  x: number;
  y: number;
}

export interface ElementSize {
  width: number;
  height: number;
}

export interface ElementStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  border?: string;
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
  design_data: string; // JSON stringified { dimensions: ElementSize; elements: TemplateElement[]; }
  created_at: string;
  updated_at: string;
}

export interface TemplateError {
  code: string;
  message: string;
}

export class TemplateValidationError extends Error {
  constructor(message: string, public errors: TemplateError[] = []) {
    super(message);
    this.name = 'TemplateValidationError';
  }
}

export const DEFAULT_ELEMENT_SIZES: Record<ElementType, ElementSize> = {
  text: { width: 200, height: 50 },
  image: { width: 200, height: 200 },
  variable: { width: 150, height: 30 },
  qr: { width: 100, height: 100 },
};

export const DEFAULT_ELEMENT_STYLES: Record<ElementType, ElementStyle> = {
  text: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'sans-serif',
    textAlign: 'left',
  },
  image: {
    borderRadius: 0,
  },
  variable: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 4,
  },
  qr: {
    backgroundColor: '#ffffff',
    padding: 8,
  },
};

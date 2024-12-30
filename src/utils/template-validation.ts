import { Template, TemplateElement, TemplateError, TemplateValidationError } from '@/types/template';

export function validateElement(element: TemplateElement): TemplateError[] {
  const errors: TemplateError[] = [];

  if (!element.id) {
    errors.push({
      code: 'INVALID_ID',
      message: 'Element ID is required',
      field: 'id',
    });
  }

  if (!element.type) {
    errors.push({
      code: 'INVALID_TYPE',
      message: 'Element type is required',
      field: 'type',
    });
  }

  if (!element.position || typeof element.position.x !== 'number' || typeof element.position.y !== 'number') {
    errors.push({
      code: 'INVALID_POSITION',
      message: 'Element position must have valid x and y coordinates',
      field: 'position',
    });
  }

  if (!element.size || typeof element.size.width !== 'number' || typeof element.size.height !== 'number') {
    errors.push({
      code: 'INVALID_SIZE',
      message: 'Element size must have valid width and height',
      field: 'size',
    });
  }

  if (element.type === 'image' && !isValidImageUrl(element.content)) {
    errors.push({
      code: 'INVALID_IMAGE_URL',
      message: 'Invalid image URL format',
      field: 'content',
    });
  }

  return errors;
}

export function validateTemplate(template: Template): void {
  const errors: TemplateError[] = [];

  if (!template.id) {
    errors.push({
      code: 'INVALID_ID',
      message: 'Template ID is required',
      field: 'id',
    });
  }

  if (!template.name) {
    errors.push({
      code: 'INVALID_NAME',
      message: 'Template name is required',
      field: 'name',
    });
  }

  if (!template.user_id) {
    errors.push({
      code: 'INVALID_USER_ID',
      message: 'User ID is required',
      field: 'user_id',
    });
  }

  if (!template.design_data?.dimensions) {
    errors.push({
      code: 'INVALID_DIMENSIONS',
      message: 'Template dimensions are required',
      field: 'design_data.dimensions',
    });
  }

  if (!Array.isArray(template.design_data?.elements)) {
    errors.push({
      code: 'INVALID_ELEMENTS',
      message: 'Template elements must be an array',
      field: 'design_data.elements',
    });
  } else {
    template.design_data.elements.forEach((element, index) => {
      const elementErrors = validateElement(element);
      if (elementErrors.length > 0) {
        errors.push({
          code: 'INVALID_ELEMENT',
          message: `Invalid element at index ${index}`,
          field: `design_data.elements[${index}]`,
        });
      }
    });
  }

  if (errors.length > 0) {
    const error = new Error('Template validation failed') as TemplateValidationError;
    error.errors = errors;
    throw error;
  }
}

export function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return /^https?:$/i.test(parsedUrl.protocol) && 
           /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(parsedUrl.pathname);
  } catch {
    return false;
  }
}

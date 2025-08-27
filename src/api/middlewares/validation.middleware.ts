import { Request, Response, NextFunction } from 'express';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: readonly any[];
  custom?: (value: any) => boolean | string;
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const body = req.body;

    for (const rule of rules) {
      const value = body[rule.field];

      // Check if required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      // Skip validation if value is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      if (rule.type) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${rule.field} must be a string`);
              continue;
            }
            break;
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push(`${rule.field} must be a valid number`);
              continue;
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${rule.field} must be a boolean`);
              continue;
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`${rule.field} must be an array`);
              continue;
            }
            break;
        }
      }

      // String-specific validations
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.field} must be no more than ${rule.maxLength} characters long`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${rule.field} format is invalid`);
        }
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${rule.field} must be one of: ${rule.enum.join(', ')}`);
      }

      // Custom validation
      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `${rule.field} validation failed`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// Common validation rules
export const authValidation = {
  register: [
    { field: 'name', required: true, type: 'string' as const, minLength: 2, maxLength: 50 },
    { field: 'email', required: true, type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { field: 'password', required: true, type: 'string' as const, minLength: 6 },
    { field: 'role', required: true, type: 'string' as const, enum: ['student', 'tutor'] as const }
  ],
  login: [
    { field: 'email', required: true, type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { field: 'password', required: true, type: 'string' as const }
  ]
};

export const tutorValidation = {
  profile: [
    { field: 'bio', type: 'string' as const, maxLength: 500 },
    { field: 'subjects', type: 'array' as const },
    { field: 'availability', type: 'array' as const },
    { field: 'experience', type: 'number' as const, custom: (value) => value >= 0 || 'Experience must be non-negative' }
  ]
};

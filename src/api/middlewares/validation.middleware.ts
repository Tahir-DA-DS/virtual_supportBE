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
  return (req: Request, res: Response, next: NextFunction): void => {
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
      // Check if this is a missing fields case (all required fields missing)
      const missingFields = errors.filter(err => err.includes('is required'));
      if (missingFields.length > 0 && missingFields.length === errors.length) {
        res.status(400).json({
          message: 'All fields are required'
        });
        return;
      }

      // Check if this is an invalid role case
      const invalidRole = errors.find(err => err.includes('role') && err.includes('must be one of'));
      if (invalidRole) {
        res.status(400).json({
          message: 'Invalid role. Must be student or tutor'
        });
        return;
      }

      // Default validation failed message
      res.status(400).json({
        message: 'Validation failed',
        errors
      });
      return;
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
    { field: 'experience', type: 'number' as const, custom: (value: any) => value >= 0 || 'Experience must be non-negative' }
  ]
};

export const sessionValidation = {
  create: [
    { field: 'tutorId', required: true, type: 'string' as const },
    { field: 'subject', required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
    { field: 'startTime', required: true, type: 'string' as const, custom: (value: any) => {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date > new Date() || 'Start time must be a valid future date';
    }},
    { field: 'duration', required: true, type: 'number' as const, custom: (value: any) => 
      (value >= 15 && value <= 480) || 'Duration must be between 15 and 480 minutes'
    },
    { field: 'sessionType', type: 'string' as const, enum: ['one-on-one', 'group', 'exam-prep', 'homework-help'] as const },
    { field: 'price', required: true, type: 'number' as const, custom: (value: any) => 
      value >= 0 || 'Price must be non-negative'
    },
    { field: 'currency', type: 'string' as const, enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const },
    { field: 'notes', type: 'string' as const, maxLength: 500 }
  ],
  update: [
    { field: 'startTime', type: 'string' as const, custom: (value: any) => {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date > new Date() || 'Start time must be a valid future date';
    }},
    { field: 'duration', type: 'number' as const, custom: (value: any) => 
      (value >= 15 && value <= 480) || 'Duration must be between 15 and 480 minutes'
    },
    { field: 'status', type: 'string' as const, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'] as const },
    { field: 'notes', type: 'string' as const, maxLength: 500 },
    { field: 'meetingLink', type: 'string' as const, custom: (value: any) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'Meeting link must be a valid URL';
      }
    }},
    { field: 'recordingUrl', type: 'string' as const, custom: (value: any) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'Recording URL must be a valid URL';
      }
    }},
    { field: 'rating', type: 'number' as const, custom: (value: any) => 
      (value >= 1 && value <= 5) || 'Rating must be between 1 and 5'
    },
    { field: 'review', type: 'string' as const, maxLength: 1000 }
  ]
};

export const paymentValidation = {
  createIntent: [
    { field: 'sessionId', required: true, type: 'string' as const },
    { field: 'tutorId', required: true, type: 'string' as const },
    { field: 'amount', required: true, type: 'number' as const, custom: (value: any) => 
      value > 0 || 'Amount must be greater than 0'
    },
    { field: 'currency', type: 'string' as const, enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const },
    { field: 'description', type: 'string' as const, maxLength: 500 }
  ],
  confirm: [
    { field: 'paymentIntentId', required: true, type: 'string' as const }
  ],
  refund: [
    { field: 'amount', type: 'number' as const, custom: (value: any) => 
      !value || value > 0 || 'Refund amount must be greater than 0'
    },
    { field: 'reason', type: 'string' as const, maxLength: 200 }
  ]
};

export const chatValidation = {
  sendMessage: [
    { field: 'receiverId', required: true, type: 'string' as const },
    { field: 'content', required: true, type: 'string' as const, maxLength: 1000 },
    { field: 'messageType', type: 'string' as const, enum: ['text', 'file', 'image', 'system'] as const },
    { field: 'fileUrl', type: 'string' as const, custom: (value: any) => {
      if (value && !value.startsWith('http')) {
        return 'File URL must be a valid HTTP/HTTPS URL';
      }
      return true;
    }},
    { field: 'fileName', type: 'string' as const, maxLength: 255 },
    { field: 'fileSize', type: 'number' as const, custom: (value: any) => 
      !value || value > 0 || 'File size must be positive'
    },
    { field: 'sessionId', type: 'string' as const }
  ]
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatValidation = exports.paymentValidation = exports.sessionValidation = exports.tutorValidation = exports.authValidation = exports.validateRequest = void 0;
const validateRequest = (rules) => {
    return (req, res, next) => {
        const errors = [];
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
exports.validateRequest = validateRequest;
// Common validation rules
exports.authValidation = {
    register: [
        { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 50 },
        { field: 'email', required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        { field: 'password', required: true, type: 'string', minLength: 6 },
        { field: 'role', required: true, type: 'string', enum: ['student', 'tutor'] }
    ],
    login: [
        { field: 'email', required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        { field: 'password', required: true, type: 'string' }
    ]
};
exports.tutorValidation = {
    profile: [
        { field: 'bio', type: 'string', maxLength: 500 },
        { field: 'subjects', type: 'array' },
        { field: 'availability', type: 'array' },
        { field: 'experience', type: 'number', custom: (value) => value >= 0 || 'Experience must be non-negative' }
    ]
};
exports.sessionValidation = {
    create: [
        { field: 'tutorId', required: true, type: 'string' },
        { field: 'subject', required: true, type: 'string', minLength: 2, maxLength: 100 },
        { field: 'startTime', required: true, type: 'string', custom: (value) => {
                const date = new Date(value);
                return !isNaN(date.getTime()) && date > new Date() || 'Start time must be a valid future date';
            } },
        { field: 'duration', required: true, type: 'number', custom: (value) => (value >= 15 && value <= 480) || 'Duration must be between 15 and 480 minutes'
        },
        { field: 'sessionType', type: 'string', enum: ['one-on-one', 'group', 'exam-prep', 'homework-help'] },
        { field: 'price', required: true, type: 'number', custom: (value) => value >= 0 || 'Price must be non-negative'
        },
        { field: 'currency', type: 'string', enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
        { field: 'notes', type: 'string', maxLength: 500 }
    ],
    update: [
        { field: 'startTime', type: 'string', custom: (value) => {
                const date = new Date(value);
                return !isNaN(date.getTime()) && date > new Date() || 'Start time must be a valid future date';
            } },
        { field: 'duration', type: 'number', custom: (value) => (value >= 15 && value <= 480) || 'Duration must be between 15 and 480 minutes'
        },
        { field: 'status', type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'] },
        { field: 'notes', type: 'string', maxLength: 500 },
        { field: 'meetingLink', type: 'string', custom: (value) => {
                try {
                    new URL(value);
                    return true;
                }
                catch {
                    return 'Meeting link must be a valid URL';
                }
            } },
        { field: 'recordingUrl', type: 'string', custom: (value) => {
                try {
                    new URL(value);
                    return true;
                }
                catch {
                    return 'Recording URL must be a valid URL';
                }
            } },
        { field: 'rating', type: 'number', custom: (value) => (value >= 1 && value <= 5) || 'Rating must be between 1 and 5'
        },
        { field: 'review', type: 'string', maxLength: 1000 }
    ]
};
exports.paymentValidation = {
    createIntent: [
        { field: 'sessionId', required: true, type: 'string' },
        { field: 'tutorId', required: true, type: 'string' },
        { field: 'amount', required: true, type: 'number', custom: (value) => value > 0 || 'Amount must be greater than 0'
        },
        { field: 'currency', type: 'string', enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
        { field: 'description', type: 'string', maxLength: 500 }
    ],
    confirm: [
        { field: 'paymentIntentId', required: true, type: 'string' }
    ],
    refund: [
        { field: 'amount', type: 'number', custom: (value) => !value || value > 0 || 'Refund amount must be greater than 0'
        },
        { field: 'reason', type: 'string', maxLength: 200 }
    ]
};
exports.chatValidation = {
    sendMessage: [
        { field: 'receiverId', required: true, type: 'string' },
        { field: 'content', required: true, type: 'string', maxLength: 1000 },
        { field: 'messageType', type: 'string', enum: ['text', 'file', 'image', 'system'] },
        { field: 'fileUrl', type: 'string', custom: (value) => {
                if (value && !value.startsWith('http')) {
                    return 'File URL must be a valid HTTP/HTTPS URL';
                }
                return true;
            } },
        { field: 'fileName', type: 'string', maxLength: 255 },
        { field: 'fileSize', type: 'number', custom: (value) => !value || value > 0 || 'File size must be positive'
        },
        { field: 'sessionId', type: 'string' }
    ]
};
//# sourceMappingURL=validation.middleware.js.map
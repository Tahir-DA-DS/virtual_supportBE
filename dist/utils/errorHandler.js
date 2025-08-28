"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.handleError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
const handleError = (error) => {
    if (error instanceof AppError) {
        return {
            statusCode: error.statusCode,
            message: error.message,
            isOperational: error.isOperational
        };
    }
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError' && error.errors) {
        const messages = Object.values(error.errors).map((err) => err.message || 'Validation error');
        return {
            statusCode: 400,
            message: 'Validation failed',
            errors: messages,
            isOperational: true
        };
    }
    // Handle Mongoose duplicate key errors
    if (error.code === 11000 && error.keyValue) {
        const field = Object.keys(error.keyValue)[0] || 'field';
        return {
            statusCode: 409,
            message: `${field} already exists`,
            isOperational: true
        };
    }
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return {
            statusCode: 401,
            message: 'Invalid token',
            isOperational: true
        };
    }
    if (error.name === 'TokenExpiredError') {
        return {
            statusCode: 401,
            message: 'Token expired',
            isOperational: true
        };
    }
    // Handle unknown errors
    return {
        statusCode: 500,
        message: 'Internal server error',
        isOperational: false
    };
};
exports.handleError = handleError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map
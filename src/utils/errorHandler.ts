export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export const handleError = (error: any) => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      isOperational: error.isOperational
    };
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError' && error.errors) {
    const messages = Object.values(error.errors).map((err: any) => err.message || 'Validation error');
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

export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

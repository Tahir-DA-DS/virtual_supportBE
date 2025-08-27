import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Set required environment variables for tests if they don't exist
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
}

if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://localhost:27017/virtual_support_test';
}

// Ensure JWT_SECRET is always set for tests
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

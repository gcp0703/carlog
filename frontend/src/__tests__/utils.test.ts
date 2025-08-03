// Example tests for utility functions
// This demonstrates the testing structure for the CarLog frontend

// Import Jest globals to make this a proper TypeScript module
import { describe, test, expect } from '@jest/globals';

describe('Date Utilities', () => {
  test('format date string correctly', () => {
    const date = new Date('2024-01-15');
    const formatted = date.toLocaleDateString();
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  test('parse ISO date string', () => {
    const isoString = '2024-01-15T10:30:00.000Z';
    const date = new Date(isoString);
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(0); // January = 0
    expect(date.getDate()).toBe(15);
  });
});

describe('Number Formatting', () => {
  test('format mileage with commas', () => {
    const mileage = 25000;
    const formatted = mileage.toLocaleString();
    expect(formatted).toBe('25,000');
  });

  test('format currency correctly', () => {
    const cost = 45.99;
    const formatted = cost.toFixed(2);
    expect(formatted).toBe('45.99');
  });
});

describe('Validation Helpers', () => {
  test('validate email format', () => {
    const validEmail = 'test@example.com';
    const invalidEmail = 'invalid-email';
    
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(emailRegex.test(validEmail)).toBe(true);
    expect(emailRegex.test(invalidEmail)).toBe(false);
  });

  test('validate VIN format', () => {
    const validVin = '1HGCM82633A123456';
    const invalidVin = '123';
    
    // Basic VIN validation (17 characters, alphanumeric)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    
    expect(vinRegex.test(validVin)).toBe(true);
    expect(vinRegex.test(invalidVin)).toBe(false);
  });
});
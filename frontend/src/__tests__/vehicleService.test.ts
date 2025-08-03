// Simple utility function tests to demonstrate testing structure

// Import Jest globals to make this a proper TypeScript module
import { describe, test, expect } from '@jest/globals';
describe('Basic Utility Functions', () => {
  test('basic math operations work correctly', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
  });

  test('string operations work correctly', () => {
    expect('Hello'.toLowerCase()).toBe('hello');
    expect('World'.toUpperCase()).toBe('WORLD');
    expect('Test String'.includes('String')).toBe(true);
  });

  test('array operations work correctly', () => {
    const testArray = [1, 2, 3, 4, 5];
    expect(testArray.length).toBe(5);
    expect(testArray.includes(3)).toBe(true);
    expect(testArray.filter(n => n > 3)).toEqual([4, 5]);
  });
});
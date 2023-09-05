const isNumber = require('./isNumber');

describe('isNumber', () => {
  // Tests that the function correctly identifies a single digit number
  it('should correctly identify a single digit number', () => {
    expect(isNumber(5)).toBe(true);
  });

  // Tests that the function correctly identifies a single digit number
  it('should correctly identify a single digit number as a string', () => {
    expect(isNumber('5')).toBe(true);
  });

  // Tests that the function correctly identifies a multi-digit number
  it('should correctly identify a multi-digit number', () => {
    expect(isNumber(201, 3)).toBe(true);
  });

  // Tests that the function correctly identifies a number with the default number of digits
  it('should correctly identify a number with the default number of digits', () => {
    expect(isNumber(7)).toBe(true);
  });

  // Tests that the function correctly identifies a number with more digits than specified
  it('should correctly identify a number with more digits than specified', () => {
    expect(isNumber(1234, 3)).toBe(false);
  });

  // Tests that the function correctly identifies a number with fewer digits than specified
  it('should correctly identify a number with fewer digits than specified', () => {
    expect(isNumber(5, 2)).toBe(false);
  });

  // Tests that the function correctly identifies a number with fewer digits than specified
  it('should correctly identify a number with fewer digits than specified', () => {
    expect(isNumber(5.30, 1)).toBe(false);
  });

  // Tests that the function correctly identifies a non-numeric value
  it('should correctly identify a non-numeric value', () => {
    expect(isNumber('abc')).toBe(false);
  });

  // Tests that the function correctly identifies a non-numeric value
  it('should correctly identify a non-numeric value', () => {
    expect(isNumber(null)).toBe(false);
  });

  // Tests that the function correctly identifies a non-numeric value
  it('should correctly identify a non-numeric value', () => {
    expect(isNumber([])).toBe(false);
  });

  // Tests that the function correctly identifies a non-numeric value
  it('should correctly identify a non-numeric value', () => {
    expect(isNumber({})).toBe(false);
  });
});

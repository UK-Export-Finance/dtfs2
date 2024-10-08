import { isNumber } from './isNumber';

describe('isNumber', () => {
  it('should correctly identify a single digit number', () => {
    expect(isNumber(5)).toBe(true);
  });

  it('should correctly identify a single digit number as a string', () => {
    expect(isNumber('5')).toBe(true);
  });

  it('should correctly identify a multi-digit number', () => {
    expect(isNumber(201, 3)).toBe(true);
  });

  it('should correctly identify a number with the default number of digits', () => {
    expect(isNumber(7)).toBe(true);
  });

  it('should correctly identify a number with more digits than specified', () => {
    expect(isNumber(1234, 3)).toBe(false);
  });

  it('should correctly identify a number with fewer digits than specified', () => {
    expect(isNumber(5, 2)).toBe(false);
  });

  it('should correctly identify a number with fewer digits than specified', () => {
    expect(isNumber(5.3, 1)).toBe(false);
  });

  it('should correctly identify a non-numeric value', () => {
    expect(isNumber('abc')).toBe(false);
  });

  it('should correctly identify a non-numeric value', () => {
    expect(isNumber(null)).toBe(false);
  });

  it('should correctly identify a non-numeric value', () => {
    expect(isNumber([])).toBe(false);
  });

  it('should correctly identify a non-numeric value', () => {
    expect(isNumber({})).toBe(false);
  });
});

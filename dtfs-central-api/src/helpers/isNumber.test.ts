import { isNumber } from './isNumber';

describe('isNumber', () => {
  it('should correctly identify a single digit number', () => {
    expect(isNumber(5)).toEqual(true);
  });

  it('should correctly identify a single digit number as a string', () => {
    expect(isNumber('5')).toEqual(true);
  });

  it('should correctly identify a multi-digit number', () => {
    expect(isNumber(201, 3)).toEqual(true);
  });

  it('should correctly identify a number with the default number of digits', () => {
    expect(isNumber(7)).toEqual(true);
  });

  it('should correctly identify a number with more digits than specified', () => {
    expect(isNumber(1234, 3)).toEqual(false);
  });

  it('should correctly identify a number with fewer digits than specified', () => {
    expect(isNumber(5, 2)).toEqual(false);
  });

  it('should correctly identify a number with fewer digits than specified', () => {
    expect(isNumber(5.3, 1)).toEqual(false);
  });

  it('should correctly identify a non-numeric value', () => {
    expect(isNumber('abc')).toEqual(false);
  });

  it('should correctly identify a non-numeric value', () => {
    expect(isNumber(null)).toEqual(false);
  });

  it('should correctly identify a non-numeric value', () => {
    expect(isNumber([])).toEqual(false);
  });

  it('should correctly identify a non-numeric value', () => {
    expect(isNumber({})).toEqual(false);
  });
});

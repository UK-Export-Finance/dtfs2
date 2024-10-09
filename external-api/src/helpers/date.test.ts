import { getNowAsEpoch } from './date';

describe('getNowAsEpoch', () => {
  afterEach(() => {
    // Ensure `jest.useFakeTimers()` is not in effect after each test
    jest.useRealTimers();
  });

  it('should return as EPOCH representing the current time in milliseconds', () => {
    const result = getNowAsEpoch();
    expect(typeof result).toEqual('number');
  });

  it('should return a value greater than or equal to the previous value', () => {
    const previousValue = getNowAsEpoch();
    const result = getNowAsEpoch();
    expect(result).toBeGreaterThanOrEqual(previousValue);
  });

  it('should return a number', () => {
    const result = getNowAsEpoch();
    expect(typeof result).toEqual('number');
  });

  it('should return a number greater than 0', () => {
    const result = getNowAsEpoch();
    expect(result).toBeGreaterThan(0);
  });

  it('should return a number less than or equal to the maximum safe integer value', () => {
    const result = getNowAsEpoch();
    expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
  });

  it('should return a number greater than or equal to the minimum safe integer value', () => {
    const result = getNowAsEpoch();
    expect(result).toBeGreaterThanOrEqual(Number.MIN_SAFE_INTEGER);
  });

  it('should return EPOCH as 0', () => {
    jest.useFakeTimers().setSystemTime(new Date('1970-01-01 01:00:00'));
    const result = getNowAsEpoch();
    expect(result).toEqual(0);
  });
});

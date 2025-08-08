import { add, sub } from 'date-fns';
import { isFutureEffectiveDate } from './amendment-future-effectiveDate';
import { getUnixTimestampSeconds, now } from './date';

describe('isFutureEffectiveDate', () => {
  it('should return false for a date in the past', () => {
    // Arrange
    const yesterday = sub(now(), { days: 1 });
    const timestamp = getUnixTimestampSeconds(yesterday);

    // Act
    const result = isFutureEffectiveDate(timestamp);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for the current date/time', () => {
    // Arrange
    const current = now();
    const timestamp = getUnixTimestampSeconds(current);

    // Act
    const result = isFutureEffectiveDate(timestamp);

    // Assert
    expect(result).toBe(false);
  });

  it('should return true for a date in the future', () => {
    // Arrange
    const tomorrow = add(now(), { days: 1 });
    const timestamp = getUnixTimestampSeconds(tomorrow);

    // Act
    const result = isFutureEffectiveDate(timestamp);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true for a far future date', () => {
    // Arrange
    const future = add(now(), { days: 10 });
    const timestamp = getUnixTimestampSeconds(future);

    // Act
    const result = isFutureEffectiveDate(timestamp);

    // Assert
    expect(result).toBe(true);
  });
});

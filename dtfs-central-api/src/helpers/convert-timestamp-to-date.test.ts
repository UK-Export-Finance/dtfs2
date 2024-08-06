import { convertTimestampToDate } from './convert-timestamp-to-date';

describe('convertTimestampToDate', () => {
  const testDate = new Date('2024-07-15');
  const timestampInSeconds = testDate.getTime() / 1000;
  const timestampInMilliseconds = testDate.getTime();

  it.each([
    { condition: 'contains non-digit characters', timestamp: 'abc' },
    { condition: 'is NaN', timestamp: NaN },
    { condition: 'is a string digits but does not have either 10 or 13 digits', timestamp: '123456' },
  ])('throws an error when the supplied timestamp $condition', ({ timestamp }) => {
    // Act / Assert
    expect(() => convertTimestampToDate(timestamp)).toThrow(Error);
  });

  it('returns the supplied date when it is already a date object', () => {
    // Arrange
    const validDate = new Date();

    // Act
    const result = convertTimestampToDate(validDate);

    // Assert
    expect(result).toEqual(validDate);
  });

  describe.each([
    { unit: 'seconds', timestamp: timestampInSeconds },
    { unit: 'milliseconds', timestamp: timestampInMilliseconds },
  ])('when the timestamp is stored in $unit', ({ timestamp }) => {
    it.each([
      { dataType: 'string', value: String(timestamp) },
      { dataType: 'number', value: Number(timestamp) },
    ])('returns the parsed date object when the timestamp is stored as a $dataType', ({ value }) => {
      // Act
      const result = convertTimestampToDate(value);

      // Assert
      expect(result).toEqual(testDate);
    });
  });
});

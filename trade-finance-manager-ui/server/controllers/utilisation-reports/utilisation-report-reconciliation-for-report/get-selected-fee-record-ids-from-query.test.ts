import { getSelectedFeeRecordIdsFromQuery } from './get-selected-fee-record-ids-from-query';

describe('getSelectedFeeRecordIdsFromQuery', () => {
  it('should return an empty set when query string is undefined', () => {
    // Arrange
    const selectedFeeRecordIdsQueryString = undefined;

    // Act
    const selectedFeeRecordIds = getSelectedFeeRecordIdsFromQuery(selectedFeeRecordIdsQueryString);

    // Assert
    expect(selectedFeeRecordIds).toEqual(new Set());
  });

  it('should return a set with one id when query string contains one id', () => {
    // Arrange
    const selectedFeeRecordIdsQueryString = '7';
    const expectedSelectedFeeRecordIds = [7];

    // Act
    const selectedFeeRecordIds = getSelectedFeeRecordIdsFromQuery(selectedFeeRecordIdsQueryString);

    // Assert
    expect(selectedFeeRecordIds).toEqual(new Set(expectedSelectedFeeRecordIds));
  });

  it('should return a set with multiple ids when query string contains multiple ids', () => {
    // Arrange
    const selectedFeeRecordIdsQueryString = '7,77,777';
    const expectedSelectedFeeRecordIds = [7, 77, 777];

    // Act
    const selectedFeeRecordIds = getSelectedFeeRecordIdsFromQuery(selectedFeeRecordIdsQueryString);

    // Assert
    expect(selectedFeeRecordIds).toEqual(new Set(expectedSelectedFeeRecordIds));
  });

  it('should handle query string with empty values', () => {
    // Arrange
    const selectedFeeRecordIdsQueryString = '1,,2';
    const expectedSelectedFeeRecordIds = [1, 2];

    // Act
    const selectedFeeRecordIds = getSelectedFeeRecordIdsFromQuery(selectedFeeRecordIdsQueryString);

    // Assert
    expect(selectedFeeRecordIds).toEqual(new Set(expectedSelectedFeeRecordIds));
  });

  it('should return a set with only numeric ids when query string contains non-numeric chars', () => {
    // Arrange
    const selectedFeeRecordIdsQueryString = '1,abc2,3';
    const expectedSelectedFeeRecordIds = [1, 3];

    // Act
    const selectedFeeRecordIds = getSelectedFeeRecordIdsFromQuery(selectedFeeRecordIdsQueryString);

    // Assert
    expect(selectedFeeRecordIds).toEqual(new Set(expectedSelectedFeeRecordIds));
  });
});

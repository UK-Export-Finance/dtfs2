import { getIsCheckboxChecked } from './get-is-checkbox-checked';

describe('getIsCheckboxChecked', () => {
  it('should return false when no fee record ids are checked', () => {
    // Arrange
    const checkedFeeRecordIds = new Set([]);
    const checkboxFeeRecordIds = [1];

    // Act
    const isCheckboxChecked = getIsCheckboxChecked(checkedFeeRecordIds);
    const result = isCheckboxChecked(checkboxFeeRecordIds);

    // Assert
    expect(result).toEqual(false);
  });

  it('should return false when checkbox fee record ids do not match any checked fee record ids', () => {
    // Arrange
    const checkedFeeRecordIds = new Set([1, 2, 3]);
    const checkboxFeeRecordIds = [10];

    // Act
    const isCheckboxChecked = getIsCheckboxChecked(checkedFeeRecordIds);
    const result = isCheckboxChecked(checkboxFeeRecordIds);

    // Assert
    expect(result).toEqual(false);
  });

  it('should return false when checkbox fee record ids only partially match checked fee record ids', () => {
    // Arrange
    const checkedFeeRecordIds = new Set([1, 2, 3]);
    const checkboxFeeRecordIds = [1, 2, 7];

    // Act
    const isCheckboxChecked = getIsCheckboxChecked(checkedFeeRecordIds);
    const result = isCheckboxChecked(checkboxFeeRecordIds);

    // Assert
    expect(result).toEqual(false);
  });

  it('should return true when all checkbox fee record ids match a checked fee record ids', () => {
    // Arrange
    const checkedFeeRecordIds = new Set([1, 2, 7]);
    const checkboxFeeRecordIds = [2, 7];

    // Act
    const isCheckboxChecked = getIsCheckboxChecked(checkedFeeRecordIds);
    const result = isCheckboxChecked(checkboxFeeRecordIds);

    // Assert
    expect(result).toEqual(true);
  });
});

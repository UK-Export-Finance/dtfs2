import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';
import { getIsCheckboxCheckedFromQuery } from './get-is-checkbox-checked-from-query';

describe('getIsCheckboxCheckedFromQuery', () => {
  it('should return undefined when selectedFeeRecordIdsQuery is undefined', () => {
    // Arrange
    const selectedFeeRecordIdsQuery = undefined;

    // Act
    const result = getIsCheckboxCheckedFromQuery(selectedFeeRecordIdsQuery);

    // Assert
    expect(result).toBeUndefined();
  });

  it('should return undefined when selectedFeeRecordIdsQuery is an empty string', () => {
    // Arrange
    const selectedFeeRecordIdsQuery = '';

    // Act
    const result = getIsCheckboxCheckedFromQuery(selectedFeeRecordIdsQuery);

    // Assert
    expect(result).toBeUndefined();
  });

  it('should return true when checkbox ID matches a selected fee record id', () => {
    // Arrange
    const selectedFeeRecordIdsQuery = '1,2,7';
    const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-6,7,8-reportedPaymentsCurrency-GBP-status-TO_DO`;

    // Act
    const isCheckboxChecked = getIsCheckboxCheckedFromQuery(selectedFeeRecordIdsQuery);
    const result = isCheckboxChecked!(checkboxId);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false when checkbox ID does not match any selected fee record ids', () => {
    // Arrange
    const selectedFeeRecordIdsQuery = '1,2,3';
    const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-10,11,12-reportedPaymentsCurrency-GBP-status-TO_DO`;

    // Act
    const isCheckboxChecked = getIsCheckboxCheckedFromQuery(selectedFeeRecordIdsQuery);
    const result = isCheckboxChecked!(checkboxId);

    // Assert
    expect(result).toBe(false);
  });
});

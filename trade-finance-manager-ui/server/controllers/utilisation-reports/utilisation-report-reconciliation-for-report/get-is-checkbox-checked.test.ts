import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';
import { getIsCheckboxChecked } from './get-is-checkbox-checked';

describe('getIsCheckboxChecked', () => {
  it('should return false when no fee record ids are checked', () => {
    // Arrange
    const checkedFeeRecordIds = new Set([]);
    const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-10,11,12-reportedPaymentsCurrency-GBP-status-TO_DO`;

    // Act
    const isCheckboxChecked = getIsCheckboxChecked(checkedFeeRecordIds);
    const result = isCheckboxChecked(checkboxId);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when checkbox ID does not match any selected fee record ids', () => {
    // Arrange
    const checkedFeeRecordIds = new Set([1, 2, 3]);
    const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-10,11,12-reportedPaymentsCurrency-GBP-status-TO_DO`;

    // Act
    const isCheckboxChecked = getIsCheckboxChecked(checkedFeeRecordIds);
    const result = isCheckboxChecked(checkboxId);

    // Assert
    expect(result).toBe(false);
  });

  it('should return true when checkbox ID matches a selected fee record id', () => {
    // Arrange
    const checkedFeeRecordIds = new Set([1, 2, 7]);
    const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-6,7,8-reportedPaymentsCurrency-GBP-status-TO_DO`;

    // Act
    const isCheckboxChecked = getIsCheckboxChecked(checkedFeeRecordIds);
    const result = isCheckboxChecked(checkboxId);

    // Assert
    expect(result).toBe(true);
  });
});

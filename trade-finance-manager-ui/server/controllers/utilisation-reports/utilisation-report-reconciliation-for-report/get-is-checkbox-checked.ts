import { getFeeRecordIdsFromPremiumPaymentsCheckboxId } from '../../../helpers/premium-payments-table-checkbox-id-helper';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';

export const getIsCheckboxChecked = (checkedFeeRecordIds: Set<number>): ((checkboxId: PremiumPaymentsTableCheckboxId) => boolean) => {
  return (checkboxId: PremiumPaymentsTableCheckboxId): boolean => {
    const checkboxFeeRecordIds = getFeeRecordIdsFromPremiumPaymentsCheckboxId(checkboxId);

    return checkboxFeeRecordIds.some((feeRecordId) => checkedFeeRecordIds.has(feeRecordId));
  };
};

import { getFeeRecordIdsFromPremiumPaymentsCheckboxId } from '../../../helpers/premium-payments-table-checkbox-id-helper';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';

export const getIsCheckboxCheckedFromQuery = (
  selectedFeeRecordIdsQuery: string | undefined,
): ((checkboxId: PremiumPaymentsTableCheckboxId) => boolean) | undefined => {
  if (!selectedFeeRecordIdsQuery) {
    return undefined;
  }

  const selectedFeeRecordIds = selectedFeeRecordIdsQuery?.split(',').map((id) => parseInt(id, 10));

  const selectedFeeRecordIdsSet = new Set(selectedFeeRecordIds);
  if (selectedFeeRecordIdsSet.size === 0) {
    return undefined;
  }

  return (checkboxId: PremiumPaymentsTableCheckboxId): boolean => {
    const checkboxFeeRecordIds = getFeeRecordIdsFromPremiumPaymentsCheckboxId(checkboxId);

    return checkboxFeeRecordIds.some((feeRecordId) => selectedFeeRecordIdsSet.has(feeRecordId));
  };
};

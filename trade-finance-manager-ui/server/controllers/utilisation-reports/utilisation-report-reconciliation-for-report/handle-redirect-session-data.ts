import { SessionData } from 'express-session';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { getAddPaymentError } from '../helpers/get-add-payment-error-helper';
import { getGenerateKeyingDataError } from '../helpers';
import {
  getFeeRecordIdsFromPremiumPaymentsCheckboxIds,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../../helpers/premium-payments-table-checkbox-id-helper';

/**
 * Handles redirect session data for utilisation report reconciliation.
 *
 * @param sessionData - The session data
 * @param sessionData.addPaymentErrorKey - The add payment error key
 * @param sessionData.generateKeyingDataErrorKey - The generate keying data error key
 * @param sessionData.checkedCheckboxIds - The checked checkbox IDs
 * @returns An object containing selected fee record IDs and optionally a
 * premium payments table data error
 * @throws {Error} If an unrecognised error key is provided
 */
export const handleRedirectSessionData = ({
  addPaymentErrorKey,
  generateKeyingDataErrorKey,
  checkedCheckboxIds: checkedCheckboxIdsSession,
}: Partial<SessionData>): {
  premiumPaymentsTableDataError?: ErrorSummaryViewModel;
  selectedFeeRecordIds: Set<number>;
} => {
  if (generateKeyingDataErrorKey) {
    switch (generateKeyingDataErrorKey) {
      case 'no-matching-fee-records':
        return {
          premiumPaymentsTableDataError: getGenerateKeyingDataError(generateKeyingDataErrorKey),
          selectedFeeRecordIds: new Set(),
        };
      default:
        throw new Error(`Unrecognised generate keying data error key '${generateKeyingDataErrorKey}'`);
    }
  }

  if (!addPaymentErrorKey) {
    return {
      selectedFeeRecordIds: new Set(),
    };
  }

  const checkedCheckboxIdRecords = { ...checkedCheckboxIdsSession };
  const checkedCheckboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(checkedCheckboxIdRecords);
  const selectedFeeRecordIds = getFeeRecordIdsFromPremiumPaymentsCheckboxIds(checkedCheckboxIds);
  const selectedFeeRecordIdsSet = new Set(selectedFeeRecordIds);

  switch (addPaymentErrorKey) {
    case 'no-fee-records-selected':
    case 'different-fee-record-statuses':
    case 'different-fee-record-payment-currencies':
    case 'multiple-does-not-match-selected':
      return { premiumPaymentsTableDataError: getAddPaymentError(addPaymentErrorKey), selectedFeeRecordIds: selectedFeeRecordIdsSet };
    default:
      throw new Error(`Unrecognised add payment error key '${addPaymentErrorKey}'`);
  }
};

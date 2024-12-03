import { SessionData } from 'express-session';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { getAddPaymentError, validateAddPaymentErrorKey } from '../helpers/premium-payments-errors/add-payment-error';
import {
  getGenerateKeyingDataError,
  getInitiateRecordCorrectionRequestError,
  validateGenerateKeyingDataErrorKey,
  validateInitiateRecordCorrectionErrorKey,
} from '../helpers';
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
  initiateRecordCorrectionRequestErrorKey,
  checkedCheckboxIds: checkedCheckboxIdsSession,
}: Partial<SessionData>): {
  premiumPaymentsTableDataError?: ErrorSummaryViewModel;
  selectedFeeRecordIds: Set<number>;
} => {
  if (generateKeyingDataErrorKey) {
    validateGenerateKeyingDataErrorKey(generateKeyingDataErrorKey);
    return {
      premiumPaymentsTableDataError: getGenerateKeyingDataError(generateKeyingDataErrorKey),
      selectedFeeRecordIds: new Set(),
    };
  }

  if (addPaymentErrorKey || initiateRecordCorrectionRequestErrorKey) {
    const checkedCheckboxIdRecords = { ...checkedCheckboxIdsSession };
    const checkedCheckboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(checkedCheckboxIdRecords);
    const selectedFeeRecordIds = getFeeRecordIdsFromPremiumPaymentsCheckboxIds(checkedCheckboxIds);
    const selectedFeeRecordIdsSet = new Set(selectedFeeRecordIds);

    if (addPaymentErrorKey) {
      validateAddPaymentErrorKey(addPaymentErrorKey);
      return { premiumPaymentsTableDataError: getAddPaymentError(addPaymentErrorKey), selectedFeeRecordIds: selectedFeeRecordIdsSet };
    }

    if (initiateRecordCorrectionRequestErrorKey) {
      validateInitiateRecordCorrectionErrorKey(initiateRecordCorrectionRequestErrorKey);
      return {
        premiumPaymentsTableDataError: getInitiateRecordCorrectionRequestError(initiateRecordCorrectionRequestErrorKey),
        selectedFeeRecordIds: selectedFeeRecordIdsSet,
      };
    }
  }

  return {
    selectedFeeRecordIds: new Set(),
  };
};

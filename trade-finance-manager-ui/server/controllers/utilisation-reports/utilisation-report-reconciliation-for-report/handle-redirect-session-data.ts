import { SessionData } from 'express-session';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { getAddPaymentError } from '../helpers/get-add-payment-error-helper';
import { getGenerateKeyingDataError } from '../helpers';
import {
  getFeeRecordIdsFromPremiumPaymentsCheckboxIds,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../../helpers/premium-payments-table-checkbox-id-helper';

export const handleRedirectSessionData = ({
  addPaymentErrorKey,
  generateKeyingDataErrorKey,
  checkedCheckboxIds: checkedCheckboxIdsSession,
}: Partial<SessionData>): {
  tableDataError: ErrorSummaryViewModel | undefined;
  selectedFeeRecordIds: Set<number>;
} => {
  if (generateKeyingDataErrorKey) {
    switch (generateKeyingDataErrorKey) {
      case 'no-matching-fee-records':
        return {
          tableDataError: getGenerateKeyingDataError(generateKeyingDataErrorKey),
          selectedFeeRecordIds: new Set(),
        };
      default:
        throw new Error(`Unrecognised generate keying data error key '${generateKeyingDataErrorKey}'`);
    }
  }

  if (!addPaymentErrorKey) {
    return {
      tableDataError: undefined,
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
      return { tableDataError: getAddPaymentError(addPaymentErrorKey), selectedFeeRecordIds: selectedFeeRecordIdsSet };
    default:
      throw new Error(`Unrecognised add payment error key '${addPaymentErrorKey}'`);
  }
};

import { Request } from 'express';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { getAddPaymentError } from '../helpers/get-add-payment-error-helper';
import { getGenerateKeyingDataError } from '../helpers';
import {
  getFeeRecordIdsFromPremiumPaymentsCheckboxIds,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../../helpers/premium-payments-table-checkbox-id-helper';

const clearRedirectSessionData = (req: Request): void => {
  delete req.session.addPaymentErrorKey;
  delete req.session.checkedCheckboxIds;
  delete req.session.generateKeyingDataErrorKey;
};

export const getAndClearFieldsFromRedirectSessionData = (
  req: Request,
): {
  tableError: ErrorSummaryViewModel | undefined;
  selectedFeeRecordIds: Set<number>;
} => {
  const { addPaymentErrorKey, generateKeyingDataErrorKey } = req.session;

  if (generateKeyingDataErrorKey) {
    clearRedirectSessionData(req);
    switch (generateKeyingDataErrorKey) {
      case 'no-matching-fee-records':
        return {
          tableError: getGenerateKeyingDataError(generateKeyingDataErrorKey),
          selectedFeeRecordIds: new Set(),
        };
      default:
        throw new Error(`Unrecognised generate keying data error key '${generateKeyingDataErrorKey}'`);
    }
  }

  if (!addPaymentErrorKey) {
    return {
      tableError: undefined,
      selectedFeeRecordIds: new Set(),
    };
  }

  const checkedCheckboxIdRecords = { ...req.session.checkedCheckboxIds };
  const checkedCheckboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(checkedCheckboxIdRecords);
  const selectedFeeRecordIds = getFeeRecordIdsFromPremiumPaymentsCheckboxIds(checkedCheckboxIds);
  const selectedFeeRecordIdsSet = new Set(selectedFeeRecordIds);

  switch (addPaymentErrorKey) {
    case 'no-fee-records-selected':
    case 'different-fee-record-statuses':
    case 'different-fee-record-payment-currencies':
    case 'multiple-does-not-match-selected':
      clearRedirectSessionData(req);
      return { tableError: getAddPaymentError(addPaymentErrorKey), selectedFeeRecordIds: selectedFeeRecordIdsSet };
    default:
      clearRedirectSessionData(req);
      throw new Error(`Unrecognised add payment error key '${addPaymentErrorKey}'`);
  }
};

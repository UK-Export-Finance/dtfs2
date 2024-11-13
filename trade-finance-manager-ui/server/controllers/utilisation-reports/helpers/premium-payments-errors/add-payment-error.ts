import { PREMIUM_PAYMENTS_TABLE_ERROR_HREF } from '../../../../constants/premium-payments-table-href';
import { ADD_PAYMENT_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { AddPaymentErrorKey } from '../../../../types/premium-payments-tab-error-keys';
import { ErrorSummaryViewModel } from '../../../../types/view-models';

const { NO_FEE_RECORDS_SELECTED, DIFFERENT_STATUSES, DIFFERENT_PAYMENT_CURRENCIES, MULTIPLE_DOES_NOT_MATCH_SELECTED } = ADD_PAYMENT_ERROR_KEY;

const addPaymentErrorMap: Record<AddPaymentErrorKey, ErrorSummaryViewModel> = {
  [NO_FEE_RECORDS_SELECTED]: {
    text: 'Select a fee or fees to add a payment to',
    href: PREMIUM_PAYMENTS_TABLE_ERROR_HREF,
  },
  [DIFFERENT_STATUSES]: {
    text: 'Select a fee or fees with the same status',
    href: PREMIUM_PAYMENTS_TABLE_ERROR_HREF,
  },
  [DIFFERENT_PAYMENT_CURRENCIES]: {
    text: 'Select fees with the same Reported payment currency',
    href: PREMIUM_PAYMENTS_TABLE_ERROR_HREF,
  },
  [MULTIPLE_DOES_NOT_MATCH_SELECTED]: {
    text: "Select only one fee or fee group at 'Does not match' status",
    href: PREMIUM_PAYMENTS_TABLE_ERROR_HREF,
  },
};

/**
 * Gets add payment error
 * @param addPaymentErrorKey - add payment error key
 * @returns error summary for given key
 */
export const getAddPaymentError = (addPaymentErrorKey: AddPaymentErrorKey): ErrorSummaryViewModel => addPaymentErrorMap[addPaymentErrorKey];

/**
 * Validates add payment error key
 * @param addPaymentErrorKey - add payment error key
 * @returns true if key is valid
 * @throws {Error} if the key is not valid
 */
export const validateAddPaymentErrorKey = (addPaymentErrorKey: string): addPaymentErrorKey is AddPaymentErrorKey => {
  const allKeys: string[] = Object.values(ADD_PAYMENT_ERROR_KEY);
  if (allKeys.includes(addPaymentErrorKey)) {
    return true;
  }

  throw new Error(`Unrecognised add payment error key '${addPaymentErrorKey}'`);
};

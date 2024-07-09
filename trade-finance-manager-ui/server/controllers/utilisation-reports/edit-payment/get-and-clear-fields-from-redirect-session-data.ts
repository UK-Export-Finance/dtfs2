import { Request } from 'express';
import { PaymentErrorsViewModel } from '../../../types/view-models';
import { getRemoveFeesFromPaymentError } from '../helpers/get-remove-fees-from-payment-error-helper';

const clearRedirectSessionData = (req: Request): void => {
  delete req.session.removeFeesFromPaymentErrorKey;
};

export const getAndClearFieldsFromRedirectSessionData = (
  req: Request,
): {
  errors: PaymentErrorsViewModel | undefined;
  allCheckboxesChecked?: boolean;
} => {
  const { removeFeesFromPaymentErrorKey } = req.session;

  if (!removeFeesFromPaymentErrorKey) {
    return {
      errors: undefined,
    };
  }

  const allCheckboxesChecked = removeFeesFromPaymentErrorKey === 'all-fee-records-selected';

  switch (removeFeesFromPaymentErrorKey) {
    case 'no-fee-records-selected':
    case 'all-fee-records-selected':
      clearRedirectSessionData(req);
      return {
        errors: {
          errorSummary: getRemoveFeesFromPaymentError(removeFeesFromPaymentErrorKey),
        },
        allCheckboxesChecked,
      };
    default:
      clearRedirectSessionData(req);
      throw new Error(`Unrecognised remove fees from payment error key '${removeFeesFromPaymentErrorKey}'`);
  }
};

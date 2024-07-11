import { Request } from 'express';
import { PaymentErrorsViewModel } from '../../../types/view-models';
import { getRemoveFeesFromPaymentGroupError } from '../helpers/get-remove-fees-from-payment-group-error-helper';

const clearRedirectSessionData = (req: Request): void => {
  delete req.session.removeFeesFromPaymentGroupErrorKey;
};

export const getAndClearFieldsFromRedirectSessionData = (
  req: Request,
): {
  errors: PaymentErrorsViewModel | undefined;
  allCheckboxesChecked?: boolean;
} => {
  const { removeFeesFromPaymentGroupErrorKey } = req.session;

  if (!removeFeesFromPaymentGroupErrorKey) {
    return {
      errors: undefined,
    };
  }

  const allCheckboxesChecked = removeFeesFromPaymentGroupErrorKey === 'all-fee-records-selected';

  switch (removeFeesFromPaymentGroupErrorKey) {
    case 'no-fee-records-selected':
    case 'all-fee-records-selected':
      clearRedirectSessionData(req);
      return {
        errors: {
          errorSummary: getRemoveFeesFromPaymentGroupError(removeFeesFromPaymentGroupErrorKey),
        },
        allCheckboxesChecked,
      };
    default:
      clearRedirectSessionData(req);
      throw new Error(`Unrecognised remove fees from payment error key '${removeFeesFromPaymentGroupErrorKey}'`);
  }
};

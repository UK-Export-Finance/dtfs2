import { Request } from 'express';
import { EditPaymentErrorsViewModel } from '../../../types/view-models';
import { getRemoveFeesFromPaymentError } from '../helpers/get-remove-fees-from-payment-error-helper';
import { EditPaymentFormValues } from '../../../types/edit-payment-form-values';

const clearRedirectSessionData = (req: Request): void => {
  delete req.session.removeFeesFromPaymentErrorKey;
  delete req.session.editPaymentFormValues;
};

export const getAndClearFieldsFromRedirectSessionData = (
  req: Request,
): {
  errors: EditPaymentErrorsViewModel | undefined;
  formValues: EditPaymentFormValues | undefined;
  allCheckboxesChecked?: boolean;
} => {
  const { removeFeesFromPaymentErrorKey, editPaymentFormValues } = req.session;
  clearRedirectSessionData(req);

  if (!removeFeesFromPaymentErrorKey) {
    return {
      errors: undefined,
      formValues: editPaymentFormValues,
    };
  }

  const allCheckboxesChecked = removeFeesFromPaymentErrorKey === 'all-fee-records-selected';

  switch (removeFeesFromPaymentErrorKey) {
    case 'no-fee-records-selected':
    case 'all-fee-records-selected':
      return {
        errors: getRemoveFeesFromPaymentError(removeFeesFromPaymentErrorKey),
        allCheckboxesChecked,
        formValues: editPaymentFormValues,
      };
    default:
      throw new Error(`Unrecognised remove fees from payment error key '${removeFeesFromPaymentErrorKey}'`);
  }
};

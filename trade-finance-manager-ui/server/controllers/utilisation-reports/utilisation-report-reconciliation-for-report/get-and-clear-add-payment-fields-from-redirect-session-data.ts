import { Request } from 'express';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { getAddPaymentError } from '../helpers/get-add-payment-error-helper';

const clearRedirectSessionData = (req: Request): void => {
  delete req.session.addPaymentErrorKey;
  delete req.session.checkedCheckboxIds;
};

export const getAndClearAddPaymentFieldsFromRedirectSessionData = (
  req: Request,
): {
  addPaymentErrorSummary: [ErrorSummaryViewModel] | undefined;
  isCheckboxChecked: (checkboxId: string) => boolean;
} => {
  const { addPaymentErrorKey } = req.session;
  if (!addPaymentErrorKey) {
    return {
      addPaymentErrorSummary: undefined,
      isCheckboxChecked: () => false,
    };
  }

  const checkedCheckboxIds = { ...req.session.checkedCheckboxIds };

  const isCheckboxChecked = (checkboxId: string): boolean => Boolean(checkedCheckboxIds[checkboxId]);

  switch (addPaymentErrorKey) {
    case 'no-fee-records-selected':
    case 'different-fee-record-statuses':
    case 'different-fee-record-payment-currencies':
    case 'multiple-does-not-match-selected':
      clearRedirectSessionData(req);
      return { addPaymentErrorSummary: getAddPaymentError(addPaymentErrorKey), isCheckboxChecked };
    default:
      clearRedirectSessionData(req);
      throw new Error(`Unrecognised add payment error key '${addPaymentErrorKey}'`);
  }
};

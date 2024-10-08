import { EditPaymentErrorsViewModel } from '../../../types/view-models';

export type RemoveFeesFromPaymentErrorKey = 'no-fee-records-selected' | 'all-fee-records-selected';

const removeFeesFromPaymentErrorMessageMap: Record<RemoveFeesFromPaymentErrorKey, string> = {
  'no-fee-records-selected': 'Select fee or fees to remove from the payment',
  'all-fee-records-selected': 'You cannot remove all the fees. Delete the payment instead.',
};

export const getRemoveFeesFromPaymentError = (removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey): EditPaymentErrorsViewModel => {
  const message = removeFeesFromPaymentErrorMessageMap[removeFeesFromPaymentErrorKey];
  return {
    removeSelectedFeesErrorMessage: message,
    errorSummary: [{ text: message, href: '#added-reported-fees-details-header' }],
  };
};

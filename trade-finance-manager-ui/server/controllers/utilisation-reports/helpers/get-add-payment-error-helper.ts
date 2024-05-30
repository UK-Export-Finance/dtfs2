import { ErrorSummaryViewModel } from '../../../types/view-models';

export type AddPaymentErrorKey =
  | 'no-fee-records-selected'
  | 'different-fee-record-statuses'
  | 'different-fee-record-payment-currencies'
  | 'multiple-does-not-match-selected';

const addPaymentErrorMap: Record<AddPaymentErrorKey, [ErrorSummaryViewModel]> = {
  'no-fee-records-selected': [
    {
      text: 'Select a fee or fees to add a payment to',
      href: '#no-fee-records-selected',
    },
  ],
  'different-fee-record-statuses': [
    {
      text: 'Select a fee or fees with the same status',
      href: '#different-fee-record-statuses',
    },
  ],
  'different-fee-record-payment-currencies': [
    {
      text: 'Select fees with the same Reported payment currency',
      href: '#different-fee-record-payment-currencies',
    },
  ],
  'multiple-does-not-match-selected': [
    {
      text: "Select only one fee or fee group at 'Does not match' status",
      href: '#multiple-does-not-match-selected',
    },
  ],
};

export const getAddPaymentError = (addPaymentErrorKey: AddPaymentErrorKey): [ErrorSummaryViewModel] => addPaymentErrorMap[addPaymentErrorKey];

import { ErrorSummaryViewModel } from '../../../types/view-models';

const PREMIUM_PAYMENTS_TABLE_HREF = '#premium-payments-table';

export type AddPaymentErrorKey =
  | 'no-fee-records-selected'
  | 'different-fee-record-statuses'
  | 'different-fee-record-payment-currencies'
  | 'multiple-does-not-match-selected';

const addPaymentErrorMap: Record<AddPaymentErrorKey, ErrorSummaryViewModel> = {
  'no-fee-records-selected': {
    text: 'Select a fee or fees to add a payment to',
    href: PREMIUM_PAYMENTS_TABLE_HREF,
  },
  'different-fee-record-statuses': {
    text: 'Select a fee or fees with the same status',
    href: PREMIUM_PAYMENTS_TABLE_HREF,
  },
  'different-fee-record-payment-currencies': {
    text: 'Select fees with the same Reported payment currency',
    href: PREMIUM_PAYMENTS_TABLE_HREF,
  },
  'multiple-does-not-match-selected': {
    text: "Select only one fee or fee group at 'Does not match' status",
    href: PREMIUM_PAYMENTS_TABLE_HREF,
  },
};

export const getAddPaymentError = (addPaymentErrorKey: AddPaymentErrorKey): ErrorSummaryViewModel => addPaymentErrorMap[addPaymentErrorKey];

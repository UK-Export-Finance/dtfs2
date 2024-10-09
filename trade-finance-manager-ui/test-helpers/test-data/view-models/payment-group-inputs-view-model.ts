import { PaymentGroupInputsViewModel } from '../../../server/types/view-models';

export const aPaymentGroupInputsViewModel = (): PaymentGroupInputsViewModel => [
  {
    radioId: 'paymentIds-1,2',
    payments: [
      { id: '1', formattedCurrencyAndAmount: 'GBP 1,000', reference: 'REF001' },
      { id: '2', formattedCurrencyAndAmount: 'GBP 2,000', reference: 'REF002' },
    ],
  },
  {
    radioId: 'paymentIds-3',
    payments: [{ id: '3', formattedCurrencyAndAmount: 'GBP 3,000', reference: 'REF003' }],
  },
];

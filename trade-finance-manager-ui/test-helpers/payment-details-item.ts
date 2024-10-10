import { PaymentDetails } from '../server/api-response-types';
import { aFeeRecord } from './fee-record';
import { aPayment } from './payment';

export const aPaymentDetails = (): PaymentDetails => ({
  feeRecords: [aFeeRecord()],
  payment: aPayment(),
  status: 'TO_DO',
});

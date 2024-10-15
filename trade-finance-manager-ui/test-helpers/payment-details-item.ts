import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { PaymentDetails } from '../server/api-response-types';
import { aFeeRecord } from './fee-record';
import { aPayment } from './payment';

export const aPaymentDetails = (): PaymentDetails => ({
  feeRecords: [aFeeRecord()],
  payment: aPayment(),
  status: FEE_RECORD_STATUS.TO_DO,
});

import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';

export type FeeRecordPaymentEntityGroup = {
  feeRecords: FeeRecordEntity[];
  payments: PaymentEntity[];
};

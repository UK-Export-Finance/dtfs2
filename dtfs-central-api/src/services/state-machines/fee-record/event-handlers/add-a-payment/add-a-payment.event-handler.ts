import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { NotImplementedError } from '../../../../../errors';
import { BaseFeeRecordEvent } from '../../event/base-fee-record.event';

type AddAPaymentEventPayload = {
  paymentId: number;
};

export type FeeRecordAddAPaymentEvent = BaseFeeRecordEvent<'ADD_A_PAYMENT', AddAPaymentEventPayload>;

export const handleFeeRecordAddAPaymentEvent = (
  /* eslint-disable @typescript-eslint/no-unused-vars */
  feeRecord: FeeRecordEntity,
  payload: AddAPaymentEventPayload,
  /* eslint-enable @typescript-eslint/no-unused-vars */
): Promise<FeeRecordEntity> => {
  throw new NotImplementedError('Adding a payment has not been implemented');
};

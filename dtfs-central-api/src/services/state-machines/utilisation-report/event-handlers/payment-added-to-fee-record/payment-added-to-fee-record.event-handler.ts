import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotImplementedError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

// TODO FN-1697 - define payload
type PaymentAddedToFeeRecordEventPayload = {
  feeRecordId: number;
  paymentId: number;
};

export type UtilisationReportPaymentAddedToFeeRecordEvent = BaseUtilisationReportEvent<'PAYMENT_ADDED_TO_FEE_RECORD', PaymentAddedToFeeRecordEventPayload>;

export const handleUtilisationReportPaymentAddedToFeeRecordEvent = (
  /* eslint-disable @typescript-eslint/no-unused-vars */
  report: UtilisationReportEntity,
  payload: PaymentAddedToFeeRecordEventPayload,
  /* eslint-enable @typescript-eslint/no-unused-vars */
): Promise<UtilisationReportEntity> => {
  throw new NotImplementedError('TODO FN-1697');
};

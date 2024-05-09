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
  report: UtilisationReportEntity,
  payload: PaymentAddedToFeeRecordEventPayload,
): Promise<UtilisationReportEntity> => {
  console.error('Payment added fee record error %o %o', report, payload);
  throw new NotImplementedError('TODO FN-1697');
};

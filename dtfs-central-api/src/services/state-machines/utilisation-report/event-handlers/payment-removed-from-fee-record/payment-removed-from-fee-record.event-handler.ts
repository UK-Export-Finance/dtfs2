import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotImplementedError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

// TODO FN-1697 - define payload
type PaymentRemovedFromFeeRecordEventPayload = {
  feeRecordId: number;
  paymentId: number;
};

export type UtilisationReportPaymentRemovedFromFeeRecordEvent = BaseUtilisationReportEvent<
  'PAYMENT_REMOVED_FROM_FEE_RECORD',
  PaymentRemovedFromFeeRecordEventPayload
>;

export const handleUtilisationReportPaymentRemovedFromFeeRecordEvent = (
  /* eslint-disable @typescript-eslint/no-unused-vars */
  report: UtilisationReportEntity,
  payload: PaymentRemovedFromFeeRecordEventPayload,
  /* eslint-enable @typescript-eslint/no-unused-vars */
): Promise<UtilisationReportEntity> => {
  throw new NotImplementedError('TODO FN-1697');
};

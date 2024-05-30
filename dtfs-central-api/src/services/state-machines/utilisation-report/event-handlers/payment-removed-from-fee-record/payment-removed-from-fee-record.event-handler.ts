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
  report: UtilisationReportEntity,
  payload: PaymentRemovedFromFeeRecordEventPayload,
): Promise<UtilisationReportEntity> => {
  console.error('Utilisation report payment removed from fee record error %o %o', report, payload);
  throw new NotImplementedError('TODO FN-1697');
};

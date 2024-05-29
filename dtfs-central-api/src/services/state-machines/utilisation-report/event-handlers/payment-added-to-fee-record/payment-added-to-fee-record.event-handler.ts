import { DbRequestSource, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';

type PaymentAddedToFeeRecordEventPayload = {
  requestSource: DbRequestSource;
};

export type UtilisationReportPaymentAddedToFeeRecordEvent = BaseUtilisationReportEvent<'PAYMENT_ADDED_TO_FEE_RECORD', PaymentAddedToFeeRecordEventPayload>;

export const handleUtilisationReportPaymentAddedToFeeRecordEvent = async (
  report: UtilisationReportEntity,
  { requestSource }: PaymentAddedToFeeRecordEventPayload,
): Promise<UtilisationReportEntity> => {
  if (report.status === 'RECONCILIATION_IN_PROGRESS') {
    report.updateLastUpdatedBy(requestSource);
    return await UtilisationReportRepo.save(report);
  }
  report.updateWithStatus({ status: 'RECONCILIATION_IN_PROGRESS', requestSource });
  return await UtilisationReportRepo.save(report);
};

import { EntityManager } from 'typeorm';
import { DbRequestSource, UtilisationReportEntity, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

type ManuallySetIncompleteEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
};

export type UtilisationReportManuallySetIncompleteEvent = BaseUtilisationReportEvent<'MANUALLY_SET_INCOMPLETE', ManuallySetIncompleteEventPayload>;

export const handleUtilisationReportManuallySetIncompleteEvent = async (
  report: UtilisationReportEntity,
  { requestSource, transactionEntityManager }: ManuallySetIncompleteEventPayload,
): Promise<UtilisationReportEntity> => {
  const incompleteStatusForReport: UtilisationReportReconciliationStatus = report.azureFileInfo ? 'PENDING_RECONCILIATION' : 'REPORT_NOT_RECEIVED';
  report.updateWithStatus({ status: incompleteStatusForReport, requestSource });
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};

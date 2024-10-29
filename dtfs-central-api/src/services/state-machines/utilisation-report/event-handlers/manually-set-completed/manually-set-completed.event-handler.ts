import { EntityManager } from 'typeorm';
import { DbRequestSource, UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

type ManuallySetCompletedEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
};

export type UtilisationReportManuallySetCompletedEvent = BaseUtilisationReportEvent<'MANUALLY_SET_COMPLETED', ManuallySetCompletedEventPayload>;

/**
 * Handler for the manually set complete event
 * @param report - The report
 * @param param - The payload
 * @param param.requestSource - The request source
 * @param param.transactionEntityManager - The transaction entity manager
 * @returns The modified report
 */
export const handleUtilisationReportManuallySetCompletedEvent = async (
  report: UtilisationReportEntity,
  { requestSource, transactionEntityManager }: ManuallySetCompletedEventPayload,
): Promise<UtilisationReportEntity> => {
  report.updateWithStatus({ status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED, requestSource });
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};

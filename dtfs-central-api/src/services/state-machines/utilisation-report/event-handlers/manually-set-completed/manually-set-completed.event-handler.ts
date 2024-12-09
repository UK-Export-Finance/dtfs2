import { EntityManager } from 'typeorm';
import { DbRequestSource, RECONCILIATION_COMPLETED, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';

type ManuallySetCompletedEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
};

export type UtilisationReportManuallySetCompletedEvent = BaseUtilisationReportEvent<
  typeof UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_COMPLETED,
  ManuallySetCompletedEventPayload
>;

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
  report.updateWithStatus({ status: RECONCILIATION_COMPLETED, requestSource });
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};

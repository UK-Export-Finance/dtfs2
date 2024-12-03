import { EntityManager } from 'typeorm';
import { DbRequestSource, PENDING_RECONCILIATION, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';

type ManuallySetIncompleteEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
};

export type UtilisationReportManuallySetIncompleteEvent = BaseUtilisationReportEvent<
  typeof UTILISATION_REPORT_EVENT_TYPE.MANUALLY_SET_INCOMPLETE,
  ManuallySetIncompleteEventPayload
>;

/**
 * Handler for the manually set incomplete event
 * @param report - The report
 * @param param - The payload
 * @param param.transactionEntityManager - The transaction entity manager
 * @param param.requestSource - The request source
 * @returns The modified report
 */
export const handleUtilisationReportManuallySetIncompleteEvent = async (
  report: UtilisationReportEntity,
  { requestSource, transactionEntityManager }: ManuallySetIncompleteEventPayload,
): Promise<UtilisationReportEntity> => {
  report.updateWithStatus({ status: PENDING_RECONCILIATION, requestSource });
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};

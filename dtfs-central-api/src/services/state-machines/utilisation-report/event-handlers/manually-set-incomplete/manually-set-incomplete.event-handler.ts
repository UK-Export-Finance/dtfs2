import { EntityManager } from 'typeorm';
import { DbRequestSource, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

type ManuallySetIncompleteEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
};

export type UtilisationReportManuallySetIncompleteEvent = BaseUtilisationReportEvent<'MANUALLY_SET_INCOMPLETE', ManuallySetIncompleteEventPayload>;

/**
 * Handler for the manually set incomplete event
 * @param report - The report
 * @param param - The payload
 * @returns The modified report
 */
export const handleUtilisationReportManuallySetIncompleteEvent = async (
  report: UtilisationReportEntity,
  { requestSource, transactionEntityManager }: ManuallySetIncompleteEventPayload,
): Promise<UtilisationReportEntity> => {
  report.updateWithStatus({ status: 'PENDING_RECONCILIATION', requestSource });
  return await transactionEntityManager.save(UtilisationReportEntity, report);
};

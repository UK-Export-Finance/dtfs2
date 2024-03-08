import { EntityManager } from 'typeorm';
import { DbRequestSource, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

type ManuallySetCompletedEventPayload = {
  requestSource: DbRequestSource;
  transactionEntityManager: EntityManager;
};

export type UtilisationReportManuallySetCompletedEvent = BaseUtilisationReportEvent<'MANUALLY_SET_COMPLETED', ManuallySetCompletedEventPayload>;

export const handleUtilisationReportManuallySetCompletedEvent = async (
  report: UtilisationReportEntity,
  { requestSource, transactionEntityManager }: ManuallySetCompletedEventPayload,
): Promise<UtilisationReportEntity> => {
  report.setAsCompleted({ requestSource });
  return await transactionEntityManager.getRepository(UtilisationReportEntity).save(report);
};

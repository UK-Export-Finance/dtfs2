import { UtilisationReportEntity, ReportPeriod, DbRequestSource } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../event/utilisation-report.event-type';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';

type DueReportInitialisedPayload = {
  bankId: string;
  reportPeriod: ReportPeriod;
  requestSource: DbRequestSource;
};

export type UtilisationReportDueReportInitialisedEvent = BaseUtilisationReportEvent<
  typeof UTILISATION_REPORT_EVENT_TYPE.DUE_REPORT_INITIALISED,
  DueReportInitialisedPayload
>;

/**
 * Handler for the due report initialised event
 * @param report - The report
 * @param param - The payload
 * @returns The modified report
 */
export const handleUtilisationReportDueReportInitialisedEvent = async ({
  bankId,
  reportPeriod,
  requestSource,
}: DueReportInitialisedPayload): Promise<UtilisationReportEntity> => {
  const newUtilisationReport = UtilisationReportEntity.createNotReceived({
    bankId,
    reportPeriod,
    requestSource,
  });

  return await UtilisationReportRepo.save(newUtilisationReport);
};

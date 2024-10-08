import { UtilisationReportEntity, ReportPeriod } from '@ukef/dtfs2-common';
import { NotImplementedError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

type DueReportInitialisedPayload = {
  bankId: string;
  reportPeriod: ReportPeriod;
};

export type UtilisationReportDueReportInitialisedEvent = BaseUtilisationReportEvent<'DUE_REPORT_INITIALISED', DueReportInitialisedPayload>;

/**
 * Handler for the due report initialised event
 * @param report - The report
 * @param param - The payload
 * @returns The modified report
 */
export const handleUtilisationReportDueReportInitialisedEvent = (payload: DueReportInitialisedPayload): Promise<UtilisationReportEntity> => {
  console.error('Utilisation due report error payload %o', payload);
  throw new NotImplementedError('TODO FN-1860');
};

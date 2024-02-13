import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { ReportPeriod } from '../../../../../types/utilisation-reports';
import { NotImplementedError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

type DueReportInitialisedPayload = {
  bankId: string;
  reportPeriod: ReportPeriod;
};

export type UtilisationReportDueReportInitialisedEvent = BaseUtilisationReportEvent<'DUE_REPORT_INITIALISED', DueReportInitialisedPayload>;

export const handleUtilisationReportDueReportInitialisedEvent = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  payload: DueReportInitialisedPayload,
): Promise<UtilisationReportEntity> => {
  throw new NotImplementedError('TODO FN-1860');
};

import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotImplementedError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

// TODO FN-1859 - defined payload
type ReportUploadedEventPayload = {
  csvData: string[];
};

export type UtilisationReportReportUploadedEvent = BaseUtilisationReportEvent<'REPORT_UPLOADED', ReportUploadedEventPayload>;

export const handleUtilisationReportReportUploadedEvent = (
  /* eslint-disable @typescript-eslint/no-unused-vars */
  report: UtilisationReportEntity,
  payload: ReportUploadedEventPayload,
  /* eslint-enable @typescript-eslint/no-unused-vars */
): Promise<UtilisationReportEntity> => {
  throw new NotImplementedError('TODO FN-1859');
};

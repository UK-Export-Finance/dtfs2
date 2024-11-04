import { REPORT_NOT_RECEIVED } from '@ukef/dtfs2-common';
import { InvalidReportStatusError } from '../../errors';
import { UtilisationReportResponseBody } from '../../api-response-types';

export const validateReportIsInReportNotReceivedState = (report: UtilisationReportResponseBody): void => {
  if (report.status !== REPORT_NOT_RECEIVED) {
    throw new InvalidReportStatusError(`Expected report to be in '${REPORT_NOT_RECEIVED}' state (was actually in '${report.status}' state)`);
  }
};

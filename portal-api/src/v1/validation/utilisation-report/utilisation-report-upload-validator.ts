import { ReportPeriod, UTILISATION_REPORT_RECONCILIATION_STATUS, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { InvalidReportStatusError } from '../../errors';
import api from '../../api';

export const validateReportForPeriodIsInReportNotReceivedStateAndReturnId = async (bankId: string, reportPeriod: ReportPeriod): Promise<number> => {
  const reportsForPeriod = await api.getUtilisationReports(bankId, {
    reportPeriod,
  });

  if (reportsForPeriod.length !== 1) {
    throw new InvalidReportStatusError(`Expected 1 report but found ${reportsForPeriod.length} with bank ID ${bankId} and report period '${getFormattedReportPeriodWithLongMonth(reportPeriod)}'`);
  }

  const reportForPeriod = reportsForPeriod[0];

  if (reportForPeriod.status !== 'REPORT_NOT_RECEIVED') {
    throw new InvalidReportStatusError(`Expected report to be in '${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED}' state (was actually in '${reportForPeriod.status}' state)`);
  }

  return reportForPeriod.id;
}
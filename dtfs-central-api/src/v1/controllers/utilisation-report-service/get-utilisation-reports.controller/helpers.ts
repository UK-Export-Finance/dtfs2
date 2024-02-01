import { isValidReportPeriod } from '../../../validation/utilisation-report-service/utilisation-report-validator';
import { ReportPeriod } from '../../../../types/utilisation-reports';

export const parseReportPeriod = (reportPeriod: string | undefined): ReportPeriod | undefined => {
  if (!reportPeriod) {
    return undefined;
  }

  const parsedReportPeriod = JSON.parse(reportPeriod) as unknown;
  if (isValidReportPeriod(parsedReportPeriod)) {
    return parsedReportPeriod;
  }
  return undefined;
};

import { Bank, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummaryItem } from '../../../types/utilisation-reports';

export const mapReportToSummaryItem = (bank: Bank, report: UtilisationReportEntity): UtilisationReportReconciliationSummaryItem => {
  const totalFeesReported = report.feeRecords.length;

  // TODO FN-1398 - status to be added to report fee records to allow us to calculate how
  //  many facilities are left to reconcile
  const reportedFeesLeftToReconcile = totalFeesReported;

  return {
    reportId: report.id,
    reportPeriod: report.reportPeriod,
    bank: {
      id: bank.id,
      name: bank.name,
    },
    status: report.status,
    dateUploaded: report.dateUploaded ?? undefined,
    totalFeesReported,
    reportedFeesLeftToReconcile,
  };
};

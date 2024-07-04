import { Bank, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummaryItem } from '../../../../types/utilisation-reports';

const getCountOfReconciledFeeRecords = (feeRecords: FeeRecordEntity[]): number => {
  return feeRecords.filter((feeRecord) => feeRecord.status === 'RECONCILED').length;
};

const getCountOfDistinctFacilities = (feeRecords: FeeRecordEntity[]): number => {
  const distinctFacilityIds = new Set(feeRecords.map((feeRecord) => feeRecord.facilityId));
  return distinctFacilityIds.size;
};

export const mapReportToSummaryItem = (bank: Bank, report: UtilisationReportEntity): UtilisationReportReconciliationSummaryItem => {
  const reportReceived = report.status !== 'REPORT_NOT_RECEIVED';
  const totalFacilitiesReported = getCountOfDistinctFacilities(report.feeRecords);
  const totalFeesReported = report.feeRecords.length;
  const reportedFeesLeftToReconcile = totalFeesReported - getCountOfReconciledFeeRecords(report.feeRecords);

  return {
    reportId: report.id,
    reportPeriod: report.reportPeriod,
    bank: {
      id: bank.id,
      name: bank.name,
    },
    status: report.status,
    dateUploaded: report.dateUploaded ?? undefined,
    totalFacilitiesReported: reportReceived ? totalFacilitiesReported : undefined,
    totalFeesReported: reportReceived ? totalFeesReported : undefined,
    reportedFeesLeftToReconcile: reportReceived ? reportedFeesLeftToReconcile : undefined,
  };
};

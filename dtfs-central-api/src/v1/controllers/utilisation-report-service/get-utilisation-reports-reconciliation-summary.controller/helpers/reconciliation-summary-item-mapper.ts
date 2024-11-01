import { Bank, FEE_RECORD_STATUS, FeeRecordEntity, UTILISATION_REPORT_STATUS, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummaryItem } from '../../../../../types/utilisation-reports';

const getCountOfReconciledFeeRecords = (feeRecords: FeeRecordEntity[]): number => {
  return feeRecords.filter((feeRecord) => feeRecord.status === FEE_RECORD_STATUS.RECONCILED).length;
};

const getCountOfDistinctFacilities = (feeRecords: FeeRecordEntity[]): number => {
  const distinctFacilityIds = new Set(feeRecords.map((feeRecord) => feeRecord.facilityId));
  return distinctFacilityIds.size;
};

export const mapReportToSummaryItem = (bank: Bank, report: UtilisationReportEntity): UtilisationReportReconciliationSummaryItem => {
  const reportReceived = report.status !== UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED;
  const totalFacilitiesReported = getCountOfDistinctFacilities(report.feeRecords);
  const totalFeesReported = report.feeRecords.length;

  // Reports which were marked as complete before the payment reconciliation journey was built will not have any fee records in the reconciled state,
  // but all fee records should still be considered reconciled.
  const reportedFeesLeftToReconcile =
    report.status === UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED ? 0 : totalFeesReported - getCountOfReconciledFeeRecords(report.feeRecords);

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

import { Bank, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { getUserById } from '../../../../../../repositories/users-repo';
import { getNextDueReportPeriod } from './get-next-due-report-period';
import { mapFeeRecordsToPendingCorrections } from './map-fee-records-to-pending-corrections';
import { PendingCorrectionsResponseBody } from '..';

/**
 * Maps a report with pending corrections to the pending corrections response body
 * @param report - The report
 * @param bank - The bank
 * @returns The pending corrections response body
 */
export const mapReportToPendingCorrectionsResponseBody = async (report: UtilisationReportEntity, bank: Bank): Promise<PendingCorrectionsResponseBody> => {
  if (!report.uploadedByUserId || !report.dateUploaded) {
    throw new Error(`Report with id ${report.id} with pending corrections has not yet been uploaded.`);
  }

  const uploadedByUser = await getUserById(report.uploadedByUserId);

  const nextDueReportPeriod = await getNextDueReportPeriod(bank);

  return {
    reportPeriod: report.reportPeriod,
    uploadedByFullName: `${uploadedByUser.firstname} ${uploadedByUser.surname}`,
    dateUploaded: report.dateUploaded,
    corrections: mapFeeRecordsToPendingCorrections(report.feeRecords),
    nextDueReportPeriod,
  };
};

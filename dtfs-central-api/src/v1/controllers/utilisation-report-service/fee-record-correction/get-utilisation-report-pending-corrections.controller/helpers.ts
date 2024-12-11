import { Bank, FEE_RECORD_STATUS, FeeRecordEntity, getNextReportPeriodForBankSchedule, ReportPeriod, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { getUserById } from '../../../../../repositories/users-repo';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';
import { PendingCorrection, PendingCorrectionsResponseBody } from '.';

/**
 * Maps a fee record to an array of pending corrections
 * @param feeRecord - The fee record
 * @returns An array consisting of the pending corrections for the fee record
 * mapped to the response type
 */
export const mapFeeRecordToPendingCorrectionsArray = (feeRecord: FeeRecordEntity): PendingCorrection[] => {
  return feeRecord.corrections.flatMap((correction) => {
    if (correction.isCompleted) {
      return [];
    }

    return {
      feeRecordId: feeRecord.id,
      facilityId: feeRecord.facilityId,
      exporter: feeRecord.exporter,
      additionalInfo: correction.additionalInfo,
    };
  });
};

/**
 * Maps an array of fee records to an array of pending corrections
 * @param feeRecords - The fee records
 * @returns An array consisting of the pending corrections for the fee records
 */
export const mapFeeRecordsToPendingCorrections = (feeRecords: FeeRecordEntity[]): PendingCorrection[] => {
  return feeRecords.flatMap((feeRecord) => {
    if (feeRecord.status !== FEE_RECORD_STATUS.PENDING_CORRECTION) {
      return [];
    }
    return mapFeeRecordToPendingCorrectionsArray(feeRecord);
  });
};

/**
 * Gets the next due report period for a bank with pending corrections,
 *  where the next due report period is defined as:
 * - The report period for the oldest not received report
 * - The next report period in the bank's schedule if there are no not received reports
 * @param bank - The bank
 * @returns The next due report period
 */
export const getNextDueReportPeriod = async (bank: Bank): Promise<ReportPeriod> => {
  const dueReports = await UtilisationReportRepo.findDueReportsByBankId(bank.id);

  if (dueReports.length === 0) {
    return getNextReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule);
  }
  return dueReports[0].reportPeriod;
};

/**
 * Maps a report with pending corrections to the pending corrections response body
 * @param report - The report
 * @param bank - The bank
 * @returns The pending corrections response body
 */
export const mapReportToPendingCorrectionsResponseBody = async (report: UtilisationReportEntity, bank: Bank): Promise<PendingCorrectionsResponseBody> => {
  if (report.uploadedByUserId === null || report.dateUploaded === null) {
    throw new Error(`Report with id ${report.id} with pending corrections has not yet been uploaded.`);
  }

  const uploadedByUser = await getUserById(report.uploadedByUserId);

  const nextDueReportPeriod = await getNextDueReportPeriod(bank);

  return {
    reportPeriod: report.reportPeriod,
    uploadedByUserName: `${uploadedByUser.firstname} ${uploadedByUser.surname}`,
    dateUploaded: report.dateUploaded,
    reportId: report.id,
    corrections: mapFeeRecordsToPendingCorrections(report.feeRecords),
    nextDueReportPeriod,
  };
};

import { FEE_RECORD_STATUS, FeeRecordEntity, PendingCorrection } from '@ukef/dtfs2-common';
import { mapFeeRecordEntityToReportedFees } from '../../../../../../mapping/fee-record-mapper';

/**
 * Maps a fee record to an array of pending corrections
 * @param feeRecord - The fee record
 * @returns An array consisting of the pending corrections for the fee record
 * mapped to the response type
 */
export const mapFeeRecordToPendingCorrectionsArray = (feeRecord: FeeRecordEntity): PendingCorrection[] => {
  const { facilityId, exporter } = feeRecord;

  const reportedFees = mapFeeRecordEntityToReportedFees(feeRecord);

  return feeRecord.corrections.flatMap((correction) => {
    if (correction.isCompleted) {
      return [];
    }

    return {
      facilityId,
      exporter,
      reportedFees,
      correctionId: correction.id,
      reasons: correction.reasons,
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

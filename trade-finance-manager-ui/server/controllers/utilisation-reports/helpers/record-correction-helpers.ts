import { FeeRecordCorrectionSummary } from '@ukef/dtfs2-common';
import { RecordCorrectionRowViewModel, RecordCorrectionsViewModel, FeeRecordDisplayStatus } from '../../../types/view-models';
import { getFeeRecordDisplayStatus } from './get-fee-record-display-status';

/**
 * Maps a fee record correction object to the correct format to be used by the table view model
 * @param feeRecordUtilisation - the fee record utilisation
 * @param displayStatus - the status of the record correction
 * @returns the view model for the row in the record correction table
 */
export const mapToRecordCorrectionTableRowViewModel = (
  feeRecordCorrection: FeeRecordCorrectionSummary,
  displayStatus: FeeRecordDisplayStatus,
): RecordCorrectionRowViewModel => ({
  correctionId: feeRecordCorrection.correctionId,
  feeRecordId: feeRecordCorrection.feeRecordId,
  facilityId: feeRecordCorrection.facilityId,
  exporter: feeRecordCorrection.exporter,
  reasons: feeRecordCorrection.formattedReasons,
  dateSent: feeRecordCorrection.formattedDateSent,
  requestedBy: feeRecordCorrection.requestedBy,
  status: feeRecordCorrection.status,
  displayStatus,
});

/**
 * Map the record correction details to the record correction details view model
 * @param recordCorrectionDetails - the record correction details
 * @returns the record correction details view model
 */
export const mapToRecordCorrectionViewModel = (recordCorrectionDetails: FeeRecordCorrectionSummary[]): RecordCorrectionsViewModel => {
  const mappedRows = recordCorrectionDetails.map((recordCorrection) => {
    const displayStatus = getFeeRecordDisplayStatus(recordCorrection.status);
    return mapToRecordCorrectionTableRowViewModel(recordCorrection, displayStatus);
  });

  return {
    recordCorrectionRows: mappedRows,
  };
};

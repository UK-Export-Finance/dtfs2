import { FeeRecordCorrectionSummary } from '@ukef/dtfs2-common';
import { RecordCorrectionRowViewModel, RecordCorrectionsViewModel, RecordCorrectionDisplayStatus } from '../../../types/view-models';
import { setRecordCorrectionStatus, setRecordCorrectionDisplayStatus } from './set-record-correction-status';

/**
 * Maps a fee record correction object to the correct format to be used by the table view model
 * @param feeRecordUtilisation - the fee record utilisation
 * @param displayStatus - the status of the record correction
 * @returns the view model for the row in the record correction table
 */
export const mapToRecordCorrectionTableRowViewModel = (
  feeRecordCorrection: FeeRecordCorrectionSummary,
  displayStatus: RecordCorrectionDisplayStatus,
): RecordCorrectionRowViewModel => ({
  correctionId: feeRecordCorrection.correctionId,
  feeRecordId: feeRecordCorrection.feeRecordId,
  exporter: feeRecordCorrection.exporter,
  reasons: feeRecordCorrection.formattedReasons,
  dateSent: feeRecordCorrection.formattedDateSent,
  status: setRecordCorrectionStatus(feeRecordCorrection.isCompleted),
  displayStatus,
  formattedCorrectRecords: feeRecordCorrection.formattedCorrectRecords,
  formattedOldRecords: feeRecordCorrection.formattedOldRecords,
});

/**
 * Map the record correction details to the record correction details view model
 * @param recordCorrectionDetails - the record correction details
 * @returns the record correction details view model
 */
export const mapToRecordCorrectionViewModel = (recordCorrectionDetails: FeeRecordCorrectionSummary[]): RecordCorrectionsViewModel => {
  const mappedRows = recordCorrectionDetails.map((recordCorrection) => {
    const displayStatus = setRecordCorrectionDisplayStatus(recordCorrection.isCompleted);
    return mapToRecordCorrectionTableRowViewModel(recordCorrection, displayStatus);
  });

  return {
    recordCorrectionRows: mappedRows,
  };
};

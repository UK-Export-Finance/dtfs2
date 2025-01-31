import { FeeRecordCorrectionSummary } from '@ukef/dtfs2-common';
import { RecordCorrectionRowViewModel, RecordCorrectionsViewModel } from '../../../types/view-models';
import { mapToRecordCorrectionStatus } from './map-record-correction-status';

/**
 * Maps a fee record correction object to the correct format to be used by the table view model
 * @param feeRecordUtilisation - the fee record utilisation
 * @param displayStatus - the status of the record correction
 * @returns the view model for the row in the record correction table
 */
export const mapToRecordCorrectionTableRowViewModel = (feeRecordCorrection: FeeRecordCorrectionSummary): RecordCorrectionRowViewModel => {
  const { status, displayStatus } = mapToRecordCorrectionStatus(feeRecordCorrection.isCompleted);

  return {
    correctionId: feeRecordCorrection.correctionId,
    feeRecordId: feeRecordCorrection.feeRecordId,
    exporter: feeRecordCorrection.exporter,
    reasons: feeRecordCorrection.formattedReasons,
    dateSent: feeRecordCorrection.formattedDateSent,
    status,
    displayStatus,
    formattedCorrectRecords: feeRecordCorrection.formattedCorrectRecords,
    formattedOldRecords: feeRecordCorrection.formattedOldRecords,
  };
};

/**
 * Map the record correction details to the record correction details view model
 * @param recordCorrectionDetails - the record correction details
 * @returns the record correction details view model
 */
export const mapToRecordCorrectionViewModel = (recordCorrectionDetails: FeeRecordCorrectionSummary[]): RecordCorrectionsViewModel => {
  const mappedRows = recordCorrectionDetails.map((recordCorrection) => {
    return mapToRecordCorrectionTableRowViewModel(recordCorrection);
  });

  return {
    recordCorrectionRows: mappedRows,
  };
};

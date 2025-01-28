import { FeeRecordEntity, FeeRecordCorrectionEntity } from '@ukef/dtfs2-common';
import {
  mapCorrectionReasonsToFormattedCorrectValues,
  mapCorrectionReasonsToFormattedPreviousValues,
} from '../../../../../helpers/map-correction-reasons-to-formatted-values';
import { mapCorrectionReasonsToFormattedOldFeeRecordValues } from '../../../../../helpers/map-correction-reasons-to-formatted-old-fee-record-values';

/**
 * generates formattedOldRecords and formattedCorrectRecords from correction and feeRecord
 * if correction is completed, generates previous and correct records and makes comma seperated list
 * if not complete, then returns '-' for formattedCorrectRecords
 * @param correction - the record correction entity
 * @param feeRecord - the fee record entity
 * @returns formattedOldRecords and formattedCorrectRecord
 */
export const getFormattedOldAndCorrectValues = (
  correction: FeeRecordCorrectionEntity,
  feeRecord: FeeRecordEntity,
): { formattedOldRecords: string; formattedCorrectRecords: string } => {
  /**
   * If the correction is completed the previous and new values
   * will have been stored against the correction.
   */
  if (correction.isCompleted) {
    const previousRecords = mapCorrectionReasonsToFormattedPreviousValues(correction, correction.reasons);

    const correctRecords = mapCorrectionReasonsToFormattedCorrectValues(correction, correction.reasons);

    return {
      formattedOldRecords: previousRecords.join(', '),
      formattedCorrectRecords: correctRecords.join(', '),
    };
  }

  /**
   * If the correction is not completed then there are no corrected values
   * yet as the bank is yet to provide them, and the old values are the
   * current values on the fee record as the correction has not updated
   * the fee record yet.
   */
  const oldRecords = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, correction.reasons);

  return {
    formattedOldRecords: oldRecords.join(', '),
    formattedCorrectRecords: '-',
  };
};

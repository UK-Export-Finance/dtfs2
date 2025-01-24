import { format } from 'date-fns';
import { FeeRecordEntity, FeeRecordCorrectionSummary, mapReasonsToDisplayValues } from '@ukef/dtfs2-common';
import { mapCorrectionReasonsToFormattedOldFeeRecordValues } from '../../../../../helpers/map-correction-reasons-to-formatted-old-fee-record-values';
import {
  mapCorrectionReasonsToFormattedCorrectValues,
  mapCorrectionReasonsToFormattedPreviousValues,
} from '../../../../../helpers/map-correction-reasons-to-formatted-values';

/**
 * Retrieves and constructs record correction data for the given fee records.
 * If no record corrections are found at all, an empty array is returned.
 * If any fee records have record corrections, the data is mapped to the correct format and that array of objects is returned.
 * @param feeRecords - The fee records
 * @returns Utilisation data for each fee record
 */
export const getRecordCorrectionDetails = (feeRecords: FeeRecordEntity[]): FeeRecordCorrectionSummary[] => {
  return feeRecords.flatMap((feeRecord) => {
    if (!feeRecord.corrections || feeRecord.corrections.length === 0) {
      return [];
    }

    const { id: feeRecordId, exporter } = feeRecord;

    return feeRecord.corrections.map((correction) => {
      const { id: correctionId, dateRequested, isCompleted } = correction;

      /**
       * maps the reasons array to display the current fee record values as old records
       * constructs a comma seperated string if there are more than one reason
       * the "old records" are the values before being corrected
       * set to a let as these values are not used if status is TO_DO_AMENDED
       * (as the values are then stored in correction.correctedValues or correction.previousValues)
       */
      const oldRecords = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, correction.reasons);
      let formattedOldRecords = oldRecords.join(', ');

      let formattedCorrectRecords = '-';

      /**
       * if the status isCompleted
       * then the required values are in correction.correctedValues and correction.previousValues
       * and are NOT in the base feeRecord object
       * maps the previous and the correct records and formats them
       * constructs a comma seperated string if there are more than one reason
       * formattedOldRecords are the mapped previous values
       * formattedCorrectRecords are the mapped correct values
       */
      if (isCompleted) {
        const previousRecords = mapCorrectionReasonsToFormattedPreviousValues(correction, correction.reasons);
        formattedOldRecords = previousRecords.join(', ');

        const correctRecords = mapCorrectionReasonsToFormattedCorrectValues(correction, correction.reasons);
        formattedCorrectRecords = correctRecords.join(', ');
      }

      /**
       * maps the reasons as an array of strings to display values
       * constructs a comma seperated string if there are more than one reason
       * else constructs a string with the single reason
       */
      const reasonsArray = mapReasonsToDisplayValues(correction.reasons);
      const formattedReasons = reasonsArray.join(', ');

      return {
        correctionId,
        feeRecordId,
        exporter,
        formattedReasons,
        formattedDateSent: format(dateRequested, 'dd MMM yyyy'),
        formattedOldRecords,
        formattedCorrectRecords,
        isCompleted,
      };
    });
  });
};

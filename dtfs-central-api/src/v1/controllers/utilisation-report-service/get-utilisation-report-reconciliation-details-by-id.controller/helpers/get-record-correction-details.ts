import { format } from 'date-fns';
import { FeeRecordEntity, FeeRecordCorrectionSummary, mapReasonsToDisplayValues, DATE_FORMATS } from '@ukef/dtfs2-common';
import { getFormattedOldAndCorrectValues } from './get-formatted-old-and-correct-values';

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
       * return formatted old records and formatted correct records
       * returns - if correction is not completed for formattedCorrectRecords
       */
      const { formattedOldRecords, formattedCorrectRecords } = getFormattedOldAndCorrectValues(correction, feeRecord);

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
        formattedDateSent: format(dateRequested, DATE_FORMATS.DD_MMM_YYYY),
        formattedOldRecords,
        formattedCorrectRecords,
        isCompleted,
      };
    });
  });
};

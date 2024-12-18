import { format } from 'date-fns';
import { FeeRecordEntity, FeeRecordCorrection, mapReasonsToDisplayValues } from '@ukef/dtfs2-common';

/**
 * Retrieves and constructs record correction data for the given fee records.
 * if no record corrections are found for a fee record, an empty array is returned.
 * If no record corrections are found at all, an empty array is returned.
 * If a record correction is found, the data is mapped to the correct format and that array of objects is returned.
 * @param feeRecords - The fee records
 * @returns Utilisation data for each fee record
 */
export const getRecordCorrectionDetails = (feeRecords: FeeRecordEntity[]): FeeRecordCorrection[] => {
  return feeRecords.flatMap((feeRecord) => {
    if (!feeRecord.corrections || feeRecord.corrections.length === 0) {
      return [];
    }

    return feeRecord.corrections.map((correction) => {
      const { facilityId } = feeRecord;

      /**
       * maps the reasons as an array of strings to display values
       * constructs a comma seperated string if there are more than one reason
       * else constructs a string with the single reason
       */
      const reasonsArray = mapReasonsToDisplayValues(correction.reasons);
      const reasons = reasonsArray.length > 1 ? reasonsArray.join(', ') : reasonsArray[0];

      return {
        feeRecordId: feeRecord.id,
        facilityId,
        exporter: feeRecord.exporter,
        status: feeRecord.status,
        reasons,
        dateSent: format(correction.dateRequested, 'dd MMM yyyy'),
        requestedBy: `${correction.requestedByUser.firstName} ${correction.requestedByUser.lastName}`,
      };
    });
  });
};

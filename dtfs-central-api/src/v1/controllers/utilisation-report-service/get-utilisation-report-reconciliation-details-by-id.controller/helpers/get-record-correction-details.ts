import { FeeRecordEntity, FeeRecordCorrectionSummary } from '@ukef/dtfs2-common';
import { getRecordCorrectionFields } from '../../helpers/get-record-correction-fields';

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

    return feeRecord.corrections.map((correction) => getRecordCorrectionFields(feeRecord, correction));
  });
};

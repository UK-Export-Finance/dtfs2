import { format } from 'date-fns';
import { FeeRecordEntity, mapReasonsToDisplayValues, FeeRecordCorrectionEntity, DATE_FORMATS } from '@ukef/dtfs2-common';
import { getFormattedOldAndCorrectValues } from './get-formatted-old-and-correct-values';

/**
 * gets all the fields from a record correction or fee record in the correct format for a number of pages
 * returns certain values as '-' if the correction is not completed
 * @param feeRecord - the fee record
 * @param correction - the fee record correction
 * @returns formatted fields for the record correction and fee record
 */
export const getRecordCorrectionFields = (feeRecord: FeeRecordEntity, correction: FeeRecordCorrectionEntity) => {
  const { id: feeRecordId, exporter, facilityId } = feeRecord;
  const { id: correctionId, dateRequested, isCompleted, bankTeamName, bankTeamEmails, additionalInfo, bankCommentary, dateReceived } = correction;

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

  let formattedDateReceived = '-';
  let formattedBankCommentary = '-';

  /**
   * if correction is completed and date received and bank commentary are present
   * sets their value in the correct format
   * else they will be '-'
   */
  if (isCompleted && dateReceived && bankCommentary) {
    formattedDateReceived = format(dateReceived, DATE_FORMATS.DD_MMM_YYYY);
    formattedBankCommentary = bankCommentary;
  }

  return {
    facilityId,
    correctionId,
    feeRecordId,
    exporter,
    formattedReasons,
    formattedDateSent: format(dateRequested, DATE_FORMATS.DD_MMM_YYYY),
    formattedOldRecords,
    formattedCorrectRecords,
    isCompleted,
    bankTeamName,
    bankTeamEmails: bankTeamEmails.replace(/,/g, ', '),
    additionalInfo,
    formattedBankCommentary,
    formattedDateReceived,
  };
};

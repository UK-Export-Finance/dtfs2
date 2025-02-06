import { format } from 'date-fns';
import { FeeRecordEntity, mapReasonsToDisplayValues, FeeRecordCorrectionEntity, DATE_FORMATS, RecordCorrectionFields } from '@ukef/dtfs2-common';
import { getFormattedOldAndCorrectValues } from './get-formatted-old-and-correct-values';
import { getDateReceivedAndBankCommentary } from './get-date-received-and-bank-commentary';

/**
 * gets all the fields from a record correction or fee record in the correct format for a number of pages
 * returns certain values as '-' if the correction is not completed
 * @param feeRecord - the fee record
 * @param correction - the fee record correction
 * @returns formatted fields for the record correction and fee record
 */
export const getRecordCorrectionFields = (feeRecord: FeeRecordEntity, correction: FeeRecordCorrectionEntity): RecordCorrectionFields => {
  const { id: feeRecordId, exporter, facilityId } = feeRecord;
  const {
    id: correctionId,
    dateRequested,
    isCompleted,
    bankTeamName,
    bankTeamEmails,
    additionalInfo,
    bankCommentary,
    dateReceived,
    requestedByUser,
  } = correction;

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

  const { formattedDateReceived, formattedBankCommentary } = getDateReceivedAndBankCommentary(isCompleted, dateReceived, bankCommentary);

  const formattedBankTeamEmails = bankTeamEmails.replace(/,/g, ', ');

  const formattedDateSent = format(dateRequested, DATE_FORMATS.DD_MMM_YYYY);

  const formattedRequestedByUser = `${requestedByUser.firstName} ${requestedByUser.lastName}`;

  return {
    facilityId,
    correctionId,
    feeRecordId,
    exporter,
    formattedReasons,
    formattedDateSent,
    formattedOldRecords,
    formattedCorrectRecords,
    isCompleted,
    bankTeamName,
    formattedBankTeamEmails,
    additionalInfo,
    formattedBankCommentary,
    formattedDateReceived,
    formattedRequestedByUser,
  };
};

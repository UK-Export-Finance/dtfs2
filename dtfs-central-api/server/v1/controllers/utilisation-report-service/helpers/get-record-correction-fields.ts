import { format } from 'date-fns';
import { FeeRecordEntity, mapReasonsToDisplayValues, FeeRecordCorrectionEntity, DATE_FORMATS, RecordCorrectionFields } from '@ukef/dtfs2-common';
import { getFormattedOldAndCorrectValues } from './get-formatted-old-and-correct-values';
import { getFormattedDateReceivedAndBankCommentary } from './get-formatted-date-received-and-bank-commentary';

/**
 * Extracts and formats fields from a fee record and its correction.
 * If the correction is not completed or bank commentary is not provided, some
 * formatted values are returned as "-".
 * @param feeRecord - The fee record entity.
 * @param correction - The fee record correction entity.
 * @returns Formatted fields for the fee record and correction.
 */
export const getRecordCorrectionFields = (feeRecord: FeeRecordEntity, correction: FeeRecordCorrectionEntity): RecordCorrectionFields => {
  const { id: feeRecordId, exporter, facilityId } = feeRecord;
  const {
    id: correctionId,
    dateRequested,
    isCompleted,
    bankTeamName,
    bankTeamEmails: bankTeamEmailsSerialized,
    additionalInfo,
    bankCommentary,
    dateReceived,
    requestedByUser,
  } = correction;

  const { formattedOldRecords, formattedCorrectRecords } = getFormattedOldAndCorrectValues(correction, feeRecord);

  /**
   * maps the reasons as an array of strings to display values
   * constructs a comma seperated string if there are more than one reason
   * else constructs a string with the single reason
   */
  const reasonsArray = mapReasonsToDisplayValues(correction.reasons);
  const formattedReasons = reasonsArray.join(', ');

  const { formattedDateReceived, formattedBankCommentary } = getFormattedDateReceivedAndBankCommentary(isCompleted, dateReceived, bankCommentary);

  const bankTeamEmails = bankTeamEmailsSerialized.split(',');

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
    bankTeamEmails,
    additionalInfo,
    formattedBankCommentary,
    formattedDateReceived,
    formattedRequestedByUser,
  };
};

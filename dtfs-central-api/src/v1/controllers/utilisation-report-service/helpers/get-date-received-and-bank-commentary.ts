import { format } from 'date-fns';
import { DATE_FORMATS } from '@ukef/dtfs2-common';

/**
 * returns formattedDateReceived and bankCommentary
 * if correction is completed and date received and bank commentary are present
 * sets their values in the correct format
 * else they will be '-'
 * @param isCompleted - if correction is completed
 * @param dateReceived - date the correction was received
 * @param bankCommentary - bank commentary on correction
 * @returns formattedDateReceived and formattedBankCommentary with values or dashes
 */
export const getDateReceivedAndBankCommentary = (isCompleted: boolean, dateReceived?: Date | null, bankCommentary?: string | null) => {
  if (isCompleted && dateReceived && bankCommentary) {
    return {
      formattedDateReceived: format(dateReceived, DATE_FORMATS.DD_MMM_YYYY),
      formattedBankCommentary: bankCommentary,
    };
  }

  return {
    formattedDateReceived: '-',
    formattedBankCommentary: '-',
  };
};

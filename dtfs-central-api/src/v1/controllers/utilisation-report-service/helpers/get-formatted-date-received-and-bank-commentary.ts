import { format } from 'date-fns';
import { DATE_FORMATS } from '@ukef/dtfs2-common';

type FormattedDateReceivedAndBankCommentary = {
  formattedDateReceived: string;
  formattedBankCommentary: string;
};

/**
 * Returns formatted date received and bank commentary.
 *
 * If the correction is incomplete, the formatted values will be set to "-".
 * Otherwise, formats the date received and bank commentary.
 * @param isCompleted - Indicates if the correction is completed.
 * @param dateReceived - The date the correction was received, can be null.
 * @param bankCommentary - The bank commentary on the correction, can be null.
 * @returns An object containing formattedDateReceived and formattedBankCommentary with formatted values or hyphens.
 * @throws {Error} If isCompleted is true and dateReceived is null.
 */
export const getFormattedDateReceivedAndBankCommentary = (
  isCompleted: boolean,
  dateReceived: Date | null,
  bankCommentary: string | null,
): FormattedDateReceivedAndBankCommentary => {
  if (!isCompleted) {
    return {
      formattedDateReceived: '-',
      formattedBankCommentary: '-',
    };
  }

  if (!dateReceived) {
    throw new Error('dateReceived is required when isCompleted is true');
  }

  return {
    formattedDateReceived: format(dateReceived, DATE_FORMATS.DD_MMM_YYYY),
    formattedBankCommentary: bankCommentary ?? '-',
  };
};

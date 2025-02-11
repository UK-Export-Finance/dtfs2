import { format } from 'date-fns';
import { DATE_FORMATS } from '@ukef/dtfs2-common';
import { getDateReceivedAndBankCommentary } from './get-date-received-and-bank-commentary';

describe('get-date-received-and-bank-commentary', () => {
  const bankCommentary = 'abc';
  const date = new Date();

  describe('when isCompleted = false', () => {
    it('should return an object with formattedDateReceived and formattedBankCommentary as "-"', () => {
      const result = getDateReceivedAndBankCommentary(false, null, null);

      const expected = {
        formattedDateReceived: '-',
        formattedBankCommentary: '-',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when isCompleted = true but dateReceived is undefined', () => {
    it('should return an object with formattedDateReceived and formattedBankCommentary as "-"', () => {
      const result = getDateReceivedAndBankCommentary(true, undefined, bankCommentary);

      const expected = {
        formattedDateReceived: '-',
        formattedBankCommentary: '-',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when isCompleted = true but bankCommentary is undefined', () => {
    it('should return an object with formattedDateReceived and formattedBankCommentary as "-"', () => {
      const result = getDateReceivedAndBankCommentary(true, date);

      const expected = {
        formattedDateReceived: '-',
        formattedBankCommentary: '-',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when isCompleted = true and all other values are provided', () => {
    it('should return an object with formattedDateReceived and formattedBankCommentary as "-"', () => {
      const result = getDateReceivedAndBankCommentary(true, date, bankCommentary);

      const expected = {
        formattedDateReceived: format(date, DATE_FORMATS.DD_MMM_YYYY),
        formattedBankCommentary: bankCommentary,
      };

      expect(result).toEqual(expected);
    });
  });
});

import { format } from 'date-fns';
import { DATE_FORMATS } from '@ukef/dtfs2-common';
import { getFormattedDateReceivedAndBankCommentary } from './get-formatted-date-received-and-bank-commentary';

describe('get-formatted-date-received-and-bank-commentary', () => {
  describe('getFormattedDateReceivedAndBankCommentary', () => {
    describe('when isCompleted is false', () => {
      const isCompleted = false;
      const dateReceived = null;
      const bankCommentary = null;

      it('should return an object with formattedDateReceived and formattedBankCommentary both set to "-"', () => {
        // Act
        const result = getFormattedDateReceivedAndBankCommentary(isCompleted, dateReceived, bankCommentary);

        // Assert
        const expected = {
          formattedDateReceived: '-',
          formattedBankCommentary: '-',
        };

        expect(result).toEqual(expected);
      });
    });

    describe('when isCompleted is true and dateReceived is null', () => {
      const isCompleted = true;
      const dateReceived = null;
      const bankCommentary = null;

      it('should throw an error', () => {
        const expectedError = 'dateReceived is required when isCompleted is true';

        // Act & Assert
        expect(() => getFormattedDateReceivedAndBankCommentary(isCompleted, dateReceived, bankCommentary)).toThrow(expectedError);
      });
    });

    describe('when isCompleted is true and bankCommentary is null', () => {
      const isCompleted = true;
      const dateReceived = new Date('2024-02-01');
      const bankCommentary = null;

      it('should return an object with formattedDateReceived set to the formatted date and formattedBankCommentary set to "-"', () => {
        // Act
        const result = getFormattedDateReceivedAndBankCommentary(isCompleted, dateReceived, bankCommentary);

        // Assert
        const expected = {
          formattedDateReceived: format(dateReceived, DATE_FORMATS.DD_MMM_YYYY),
          formattedBankCommentary: '-',
        };

        expect(result).toEqual(expected);
      });
    });

    describe('when isCompleted is true and bankCommentary is not null', () => {
      const isCompleted = true;
      const dateReceived = new Date('2024-02-01');
      const bankCommentary = 'Some bank commentary';

      it('should return an object with formattedDateReceived set to the formatted date and formattedBankCommentary set to the bank commentary', () => {
        // Act
        const result = getFormattedDateReceivedAndBankCommentary(isCompleted, dateReceived, bankCommentary);

        // Assert
        const expected = {
          formattedDateReceived: format(dateReceived, DATE_FORMATS.DD_MMM_YYYY),
          formattedBankCommentary: bankCommentary,
        };

        expect(result).toEqual(expected);
      });
    });
  });
});

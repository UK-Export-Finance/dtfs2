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
        const expectedError = 'Correction marked as completed, but date received is not set';

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

    describe.each`
      bankCommentaryLengthDescription | bankCommentary
      ${'short'}                      | ${'Some bank commentary'}
      ${'long'}                       | ${'This is a very long bank commentary. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec lobortis bibendum sapien et elementum. Morbi vulputate ante luctus, efficitur elit non, venenatis orci. Cras molestie eget sapien at lacinia. Phasellus non accumsan nisl, in consequat tellus. Proin sed dui varius, pretium nibh in, pellentesque lacus. Aenean egestas posuere arcu in placerat. Nullam consequat purus vitae dolor ultricies, sed vulputate nibh accumsan.'}
    `('when isCompleted is true and bankCommentary is not null and is $bankCommentaryLengthDescription', ({ bankCommentary }: { bankCommentary: string }) => {
      const isCompleted = true;
      const dateReceived = new Date('2024-02-01');

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

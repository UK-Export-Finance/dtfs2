import { applyStandardValidationAndParseDateInput } from '@ukef/dtfs2-common';
import { add, startOfDay } from 'date-fns';
import { getErrorObjectFromMessageAndRefs, validateBankRequestDate } from './validate-bank-request-date';
import { BankRequestDateValidationViewModel } from '../../../../types/view-models';

jest.mock('@ukef/dtfs2-common', () => ({ applyStandardValidationAndParseDateInput: jest.fn() }));

describe('validate bank request date', () => {
  describe('getErrorObjectFromMessageAndRefs', () => {
    it('correctly formats error messages', () => {
      const testErrorMessage = 'test error message';
      const testRefs = ['ref1', 'ref2'];

      const result = getErrorObjectFromMessageAndRefs(testErrorMessage, testRefs);

      const expectedResult = {
        errors: {
          summary: [{ text: testErrorMessage, href: '#ref1' }],
          bankRequestDateError: {
            message: testErrorMessage,
            fields: testRefs,
          },
        },
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe('validateBankRequestDate', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    const today = startOfDay(new Date());

    const validDates = [
      {
        description: 'today',
        date: today,
      },
      {
        description: `11 months in the future`,
        date: add(today, { months: 11 }),
      },
      {
        description: `11 months in the past`,
        date: add(today, { months: -11 }),
      },
    ];

    it.each(validDates)('returns no errors when the date is $description', ({ date }) => {
      // Arrange
      jest.mocked(applyStandardValidationAndParseDateInput).mockReturnValueOnce({ error: null, parsedDate: date });

      const day = date.getDate().toString();
      const month = (date.getMonth() + 1).toString();
      const year = date.getUTCFullYear().toString();

      // Act
      const result = validateBankRequestDate({ day, month, year });

      // Assert
      const expected: BankRequestDateValidationViewModel = {
        errors: null,
        bankRequestDate: date,
      };
      expect(result).toEqual(expected);
    });

    describe('custom date validation rules', () => {
      it('returns an error if the bank request date is greater than 12 months in the future', () => {
        // Arrange
        const twelveMonthsAndDayInFuture = add(new Date(), { months: 12, days: 1 });
        jest.mocked(applyStandardValidationAndParseDateInput).mockReturnValueOnce({ error: null, parsedDate: twelveMonthsAndDayInFuture });

        const day = twelveMonthsAndDayInFuture.getDate().toString();
        const month = (twelveMonthsAndDayInFuture.getMonth() + 1).toString();
        const year = twelveMonthsAndDayInFuture.getFullYear().toString();

        // Act
        const result = validateBankRequestDate({ day, month, year });

        // Assert
        const expectedMessage = 'The bank request date cannot exceed 12 months in the future from the submission date';

        const expected = getErrorObjectFromMessageAndRefs(expectedMessage, ['bank-request-date-day', 'bank-request-date-month', 'bank-request-date-year']);

        expect(result).toEqual(expected);
      });

      it('returns an error if the bank request date is greater than 12 months in the past', () => {
        // Arrange
        const twelveMonthsAndDayInPast = add(new Date(), { months: -12, days: -1 });
        jest.mocked(applyStandardValidationAndParseDateInput).mockReturnValueOnce({ error: null, parsedDate: twelveMonthsAndDayInPast });

        const day = twelveMonthsAndDayInPast.getDate().toString();
        const month = (twelveMonthsAndDayInPast.getMonth() + 1).toString();
        const year = twelveMonthsAndDayInPast.getFullYear().toString();

        // Act
        const result = validateBankRequestDate({ day, month, year });

        // Assert
        const expectedMessage = 'The bank request date cannot exceed 12 months in the past from the submission date';

        const expected = getErrorObjectFromMessageAndRefs(expectedMessage, ['bank-request-date-day', 'bank-request-date-month', 'bank-request-date-year']);

        expect(result).toEqual(expected);
      });
    });

    describe('base date validation rules', () => {
      const dateObjectToTest = { day: '', month: '1', year: '2024' };
      const mockReturnedMessage = 'mock error message';
      const mockReturnedRef = 'mock-ref';
      const mockReturnedFieldRefs = ['mock-ref-1, mock-ref-2'];

      beforeEach(() => {
        jest
          .mocked(applyStandardValidationAndParseDateInput)
          .mockReturnValueOnce({ error: { message: mockReturnedMessage, ref: mockReturnedRef, fieldRefs: mockReturnedFieldRefs }, parsedDate: undefined });
      });

      it('should call applyStandardValidationAndParseDateInput', () => {
        validateBankRequestDate(dateObjectToTest);

        expect(applyStandardValidationAndParseDateInput).toHaveBeenCalledTimes(1);
      });

      it('should return the result of applyStandardValidationAndParseDateInput when it errors', () => {
        const result = validateBankRequestDate(dateObjectToTest);

        const expected = getErrorObjectFromMessageAndRefs(mockReturnedMessage, mockReturnedFieldRefs);

        expect(result).toEqual(expected);
      });
    });
  });
});

import { add, startOfDay } from 'date-fns';
import { applyStandardValidationAndParseDateInput } from '@ukef/dtfs2-common';
import { getErrorObjectFromMessageAndRefs, validateBankRequestDate } from './validate-bank-request-date';
import { BankRequestDateValidationViewModel } from '../../../../types/view-models';

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
      // Act
      const day = date.getDate().toString();
      const month = (date.getMonth() + 1).toString();
      const year = date.getUTCFullYear().toString();

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
        const invalidBankRequestDate = add(new Date(), { months: 12, days: 1 });
        const day = invalidBankRequestDate.getDate().toString();
        const month = (invalidBankRequestDate.getMonth() + 1).toString();
        const year = invalidBankRequestDate.getFullYear().toString();

        const result = validateBankRequestDate({ day, month, year });

        const expectedMessage = 'The bank request date cannot exceed 12 months in the future from the submission date';

        const expectedError = {
          summary: [{ text: expectedMessage, href: '#bank-request-date-day' }],
          bankRequestDateError: { message: expectedMessage, fields: ['bank-request-date-day', 'bank-request-date-month', 'bank-request-date-year'] },
        };

        expect(result.errors).toEqual(expectedError);
      });

      it('returns an error if the bank request date is greater than 12 months in the past', () => {
        const invalidBankRequestDate = add(new Date(), { months: -12, days: -1 });
        const day = invalidBankRequestDate.getDate().toString();
        const month = (invalidBankRequestDate.getMonth() + 1).toString();
        const year = invalidBankRequestDate.getFullYear().toString();

        const result = validateBankRequestDate({ day, month, year });

        const expectedMessage = 'The bank request date cannot exceed 12 months in the past from the submission date';

        const expectedError = {
          summary: [{ text: expectedMessage, href: '#bank-request-date-day' }],
          bankRequestDateError: { message: expectedMessage, fields: ['bank-request-date-day', 'bank-request-date-month', 'bank-request-date-year'] },
        };

        expect(result.errors).toEqual(expectedError);
      });
    });

    describe('base date validation rules', () => {
      it('should return the result of applyStandardValidationAndParseDateInput', () => {
        const dateObjectToTest = { day: '', month: '1', year: '2024' };

        const { errors: receivedErrors } = validateBankRequestDate(dateObjectToTest);

        const { error: expectedError } = applyStandardValidationAndParseDateInput(dateObjectToTest, 'bank request date', 'bank-request-date');

        expect(receivedErrors?.bankRequestDateError.message).toEqual(expectedError?.message);
        expect(receivedErrors?.bankRequestDateError.fields).toEqual(expectedError?.fieldRefs);
      });
    });
  });
});

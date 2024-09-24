import { add, startOfDay } from 'date-fns';
import { validateBankRequestDate } from './validate-bank-request-date';
import { BankRequestDateValidationViewModel } from '../../../../types/view-models';

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

  it('returns an error if a field is left blank', () => {
    const result = validateBankRequestDate({ day: '', month: '1', year: '2024' });

    const expectedMessage = 'Bank request date must include a day';

    const expectedError = {
      summary: [{ text: expectedMessage, href: '#bank-request-date-day' }],
      bankRequestDateError: { message: expectedMessage, fields: ['bank-request-date-day'] },
    };

    expect(result.errors).toEqual(expectedError);
  });

  it('returns an error if the bank request date is not in the correct format', () => {
    const result = validateBankRequestDate({ day: 'abc', month: 'Feb', year: '123' });

    const expectedMessage = 'Bank request date must be a real date';

    const expectedError = {
      summary: [{ text: expectedMessage, href: '#bank-request-date-day' }],
      bankRequestDateError: { message: expectedMessage, fields: ['bank-request-date-day', 'bank-request-date-month', 'bank-request-date-year'] },
    };

    expect(result.errors).toEqual(expectedError);
  });
});

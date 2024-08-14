import { add } from 'date-fns';
import { bankReviewDateValidation } from './amendmentBankReviewDate.validate';

const testCoverStartDate = new Date(2025, 7, 4);

describe('bankReviewDateValidation()', () => {
  it('should return an error if the bank review date is greater than 6 years in the future', () => {
    const testBankReviewDate = add(new Date(), { years: 6, days: 1 });
    const result = bankReviewDateValidation(
      {
        day: testBankReviewDate.getDate().toString(),
        month: (testBankReviewDate.getMonth() + 1).toString(),
        year: testBankReviewDate.getFullYear().toString(),
      },
      testCoverStartDate,
    );
    const expectedError = {
      summary: [
        {
          text: 'Bank review date cannot be greater than 6 years in the future',
        },
      ],
      fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
    };

    expect(result.error).toEqual(expectedError);
  });

  it('should not return an error if the bank review date is less than 6 years in the future', () => {
    const testBankReviewDate = add(new Date(), { years: 6, days: -1 });
    const result = bankReviewDateValidation(
      {
        day: testBankReviewDate.getDate().toString(),
        month: (testBankReviewDate.getMonth() + 1).toString(),
        year: testBankReviewDate.getFullYear().toString(),
      },
      testCoverStartDate,
    );

    expect(result.error).toEqual(null);
  });

  it('should return an error if the bank review date is before the cover start date', () => {
    const result = bankReviewDateValidation(
      {
        day: '2',
        month: '8',
        year: '2025',
      },
      testCoverStartDate,
    );
    const expectedError = {
      summary: [
        {
          text: 'The bank review date cannot be before the cover start date',
        },
      ],
      fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
    };

    expect(result.error).toEqual(expectedError);
  });

  it('should return an error if a field is left blank', () => {
    const result = bankReviewDateValidation(
      {
        day: '',
        month: '8',
        year: '2025',
      },
      testCoverStartDate,
    );
    const expectedError = {
      summary: [
        {
          text: 'Bank review date must include a day',
        },
      ],
      fields: ['bank-review-date-day'],
    };

    expect(result.error).toEqual(expectedError);
  });

  it('should return an error if nothing is entered', () => {
    const result = bankReviewDateValidation(
      {
        day: '',
        month: '',
        year: '',
      },
      testCoverStartDate,
    );
    const expectedError = {
      summary: [
        {
          text: 'Enter the bank review date',
        },
      ],
      fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
    };

    expect(result.error).toEqual(expectedError);
  });

  it('should return an error if a field in the incorrect format is entered', () => {
    const result = bankReviewDateValidation(
      {
        day: '12',
        month: '12',
        year: '20255',
      },
      testCoverStartDate,
    );
    const expectedError = {
      summary: [
        {
          text: 'Bank review date must be a real date',
        },
      ],
      fields: ['bank-review-date-year'],
    };

    expect(result.error).toEqual(expectedError);
  });

  it('should return no errors and a correctly formatted bank review date if all fields are entered correctly', () => {
    const result = bankReviewDateValidation(
      {
        day: '12',
        month: '12',
        year: '2025',
      },
      testCoverStartDate,
    );
    const expected = {
      error: null,
      bankReviewDate: new Date(2025, 11, 12, 0, 0, 0),
    };

    expect(result).toEqual(expected);
  });
});

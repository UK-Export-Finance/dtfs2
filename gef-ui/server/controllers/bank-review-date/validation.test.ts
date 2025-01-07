import { add, startOfDay } from 'date-fns';
import { applyStandardValidationAndParseDateInput } from '@ukef/dtfs2-common';
import { validateAndParseBankReviewDate } from './validation';

const valueName = 'bank review date';
const valueRef = 'bankReviewDate';

describe('validateAndParseBankReviewDate', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should map the response from applyStandardValidationAndParseDateInput', () => {
    // Arrange
    const dayMonthYear = {
      day: 'x',
      year: '2024',
      month: '1',
    };

    // Act
    const response = validateAndParseBankReviewDate(dayMonthYear, new Date());

    // Assert
    expect(response).toEqual({
      errors: [
        {
          errMsg: applyStandardValidationAndParseDateInput(dayMonthYear, valueName, valueRef).error!.message,
          errRef: valueRef,
          subFieldErrorRefs: applyStandardValidationAndParseDateInput(dayMonthYear, valueName, valueRef).error!.fieldRefs,
        },
      ],
    });
  });

  it('returns error if date is before cover start date', () => {
    // Arrange
    const bankReviewDate = new Date();
    const coverStartDate = add(new Date(), { days: 1 });

    // Act
    const result = validateAndParseBankReviewDate(
      { day: bankReviewDate.getDate().toString(), month: (bankReviewDate.getMonth() + 1).toString(), year: bankReviewDate.getFullYear().toString() },
      coverStartDate,
    );

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: 'bankReviewDate',
          errMsg: 'Bank review date cannot be before the cover start date',
          subFieldErrorRefs: ['bankReviewDate-day', 'bankReviewDate-month', 'bankReviewDate-year'],
        },
      ],
    });
  });

  it('returns error if date is 6 years in the future', () => {
    // Arrange
    const bankReviewDate = add(new Date(), { years: 6, days: 1 });
    const coverStartDate = add(new Date(), { days: 1 });

    // Act
    const result = validateAndParseBankReviewDate(
      { day: bankReviewDate.getDate().toString(), month: (bankReviewDate.getMonth() + 1).toString(), year: bankReviewDate.getFullYear().toString() },
      coverStartDate,
    );

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: 'bankReviewDate',
          errMsg: 'Bank review date cannot be greater than 6 years in the future',
          subFieldErrorRefs: ['bankReviewDate-day', 'bankReviewDate-month', 'bankReviewDate-year'],
        },
      ],
    });
  });

  it('returns date if valid', () => {
    // Arrange
    const bankReviewDate = startOfDay(add(new Date(), { years: 1 }));
    const coverStartDate = add(new Date(), { days: 1 });

    // Act
    const result = validateAndParseBankReviewDate(
      { day: bankReviewDate.getDate().toString(), month: (bankReviewDate.getMonth() + 1).toString(), year: bankReviewDate.getFullYear().toString() },
      coverStartDate,
    );

    // Assert
    expect(result).toEqual({
      date: bankReviewDate,
    });
  });
});

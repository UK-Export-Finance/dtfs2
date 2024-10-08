import { add } from 'date-fns';
import { validateAndParseDayMonthYear } from '../../utils/day-month-year-validation';
import { validateAndParseBankReviewDate } from './validation';

jest.mock('../../utils/day-month-year-validation');

const mockValidateAndParseDayMonthYear = validateAndParseDayMonthYear as unknown as jest.Mock;

describe('validateAndParseBankReviewDate', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('calls validateAndParseDayMonthYear', () => {
    // Arrange
    const dayMonthYear = {
      day: 'x',
      year: '2024',
      month: '1',
    };

    const errors = [
      {
        errRef: 'date',
        errMsg: 'An Error',
      },
    ];
    mockValidateAndParseDayMonthYear.mockReturnValueOnce({
      errors,
    });

    // Act
    validateAndParseBankReviewDate(dayMonthYear, new Date());

    // Assert
    expect(validateAndParseDayMonthYear).toHaveBeenCalledWith(dayMonthYear, {
      errRef: 'bankReviewDate',
      variableDisplayName: 'bank review date',
    });
  });

  it('combines the error messages', () => {
    // Arrange
    const dayMonthYear = {
      day: 'x',
      year: '2024',
      month: '1',
    };
    const errors = [
      {
        errRef: 'date',
        errMsg: 'An Error',
        subFieldErrorRefs: ['day', 'year'],
      },
      {
        errRef: 'date',
        errMsg: 'Another Error',
        subFieldErrorRefs: ['month', 'year'],
      },
    ];

    mockValidateAndParseDayMonthYear.mockReturnValueOnce({
      errors,
    });

    // Act
    const result = validateAndParseBankReviewDate(dayMonthYear, new Date());

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: 'bankReviewDate',
          errMsg: 'Bank review date must be in the correct format DD/MM/YYYY',
          subFieldErrorRefs: ['day', 'year', 'month'],
        },
      ],
    });
  });

  it('returns error if date is before cover start date', () => {
    // Arrange
    const bankReviewDate = new Date();
    const coverStartDate = add(new Date(), { days: 1 });

    mockValidateAndParseDayMonthYear.mockReturnValueOnce({
      date: bankReviewDate,
    });

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

    mockValidateAndParseDayMonthYear.mockReturnValueOnce({
      date: bankReviewDate,
    });

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
    const bankReviewDate = add(new Date(), { years: 1 });
    const coverStartDate = add(new Date(), { days: 1 });

    mockValidateAndParseDayMonthYear.mockReturnValueOnce({
      date: bankReviewDate,
    });

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

import { getEpochMs, applyStandardValidationAndParseDateInput, COVER_END_DATE_MAXIMUM_YEARS_IN_FUTURE, DayMonthYearInput, now } from '@ukef/dtfs2-common';
import { add, format, startOfDay } from 'date-fns';
import { validateAndParseCoverEndDate } from './validation';
import { mapValidationError } from '../../../utils/map-validation-error';

const valueName = 'cover end date';
const valueRef = 'coverEndDate';
const today = now();
const getFormattedDate = (coverEndDate: Date): DayMonthYearInput => {
  return {
    day: format(coverEndDate, 'd'),
    month: format(coverEndDate, 'M'),
    year: format(coverEndDate, 'yyyy'),
  };
};

describe('validateAndParseCoverEndDate', () => {
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
    const response = validateAndParseCoverEndDate(dayMonthYear, today);

    // Assert
    expect(response).toEqual({
      errors: [mapValidationError(applyStandardValidationAndParseDateInput(dayMonthYear, valueName, valueRef).error!)],
    });
  });

  it('should return error if date is before cover start date', () => {
    // Arrange
    const coverEndDate = today;
    const coverStartDate = add(today, { days: 1 });

    // Act
    const result = validateAndParseCoverEndDate(getFormattedDate(coverEndDate), coverStartDate);

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: valueRef,
          errMsg: 'The new cover end date must be after the cover start date',
          subFieldErrorRefs: ['coverEndDate-day', 'coverEndDate-month', 'coverEndDate-year'],
        },
      ],
    });
  });

  it(`should return error if date is ${COVER_END_DATE_MAXIMUM_YEARS_IN_FUTURE} years in the future`, () => {
    // Arrange
    const coverEndDate = add(today, { years: 6, days: 1 });
    const coverStartDate = add(today, { days: 1 });

    // Act
    const result = validateAndParseCoverEndDate(getFormattedDate(coverEndDate), coverStartDate);

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: valueRef,
          errMsg: `The new cover end date cannot be greater than ${COVER_END_DATE_MAXIMUM_YEARS_IN_FUTURE} years in the future`,
          subFieldErrorRefs: ['coverEndDate-day', 'coverEndDate-month', 'coverEndDate-year'],
        },
      ],
    });
  });

  it('should return an error if the date is the same as the cover start date', () => {
    // Arrange
    const fixedDate = new Date(2025, 0, 20);
    const coverEndDate = fixedDate;
    const coverStartDate = fixedDate;

    // Act
    const result = validateAndParseCoverEndDate(getFormattedDate(coverEndDate), coverStartDate);

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: valueRef,
          errMsg: 'The new cover end date must be after the cover start date',
          subFieldErrorRefs: ['coverEndDate-day', 'coverEndDate-month', 'coverEndDate-year'],
        },
      ],
    });
  });

  it('should return cover end date if valid', () => {
    // Arrange
    const coverEndDate = startOfDay(add(today, { years: 1 }));
    const coverStartDate = add(today, { days: 1 });

    // Act
    const result = validateAndParseCoverEndDate(getFormattedDate(coverEndDate), coverStartDate);

    // Assert
    expect(result).toEqual({
      value: getEpochMs(coverEndDate),
    });
  });

  const errorTestCases = [
    {
      day: '',
      month: '',
      year: '',
    },
    {
      day: null,
      month: '',
      year: '',
    },
    {
      day: '',
      month: null,
      year: '',
    },
    {
      day: '',
      month: '',
      year: null,
    },
    {
      day: null,
      month: null,
      year: null,
    },
  ];

  errorTestCases.forEach((dayMonthYear) => {
    it('should return an error when fields are falsy', () => {
      // Act
      const response = validateAndParseCoverEndDate(dayMonthYear as unknown as DayMonthYearInput, today);

      // Assert
      expect(response).toEqual({
        errors: [mapValidationError(applyStandardValidationAndParseDateInput(dayMonthYear as unknown as DayMonthYearInput, valueName, valueRef).error!)],
      });
    });
  });
});

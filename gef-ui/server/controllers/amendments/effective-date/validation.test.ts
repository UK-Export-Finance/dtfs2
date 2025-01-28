import {
  applyStandardValidationAndParseDateInput,
  DayMonthYearInput,
  DATE_FORMATS,
  AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_FUTURE,
  AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_PAST,
} from '@ukef/dtfs2-common';
import { add, format, sub, getUnixTime, startOfDay } from 'date-fns';
import { validateAndParseEffectiveFrom } from './validation';
import { mapValidationError } from '../../../utils/map-validation-error';

const valueName = 'date amendment effective from';
const valueRef = 'effectiveFrom';
const today = startOfDay(new Date());
const getFormattedDate = (effectiveFrom: Date): DayMonthYearInput => {
  return {
    day: format(effectiveFrom, 'd'),
    month: format(effectiveFrom, 'M'),
    year: format(effectiveFrom, 'yyyy'),
  };
};

describe('validateAndParseEffectiveFrom', () => {
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
    const response = validateAndParseEffectiveFrom(dayMonthYear, today);

    // Assert
    expect(response).toEqual({
      errors: [mapValidationError(applyStandardValidationAndParseDateInput(dayMonthYear, valueName, valueRef).error!)],
    });
  });

  it('should return error if date is before cover start date', () => {
    // Arrange
    const effectiveFrom = today;
    const coverStartDate = add(today, { days: 1 });

    // Act
    const result = validateAndParseEffectiveFrom(getFormattedDate(effectiveFrom), coverStartDate);

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: valueRef,
          errMsg: `Date amendment effective from cannot be before the cover start date ${format(coverStartDate, DATE_FORMATS.D_MMMM_YYYY)}`,
          subFieldErrorRefs: ['effectiveFrom-day', 'effectiveFrom-month', 'effectiveFrom-year'],
        },
      ],
    });
  });

  it(`should return error if date is ${AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_FUTURE} days in the future`, () => {
    // Arrange
    const effectiveFrom = add(today, { days: AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_FUTURE + 1 });
    const coverStartDate = add(today, { days: 1 });

    // Act
    const result = validateAndParseEffectiveFrom(getFormattedDate(effectiveFrom), coverStartDate);

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: valueRef,
          errMsg: `You entered an amendment date more than ${AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_FUTURE} days from now. Amendments must be effective within the next ${AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_FUTURE} days - come back later or use the Schedule 8 form`,
          subFieldErrorRefs: ['effectiveFrom-day', 'effectiveFrom-month', 'effectiveFrom-year'],
        },
      ],
    });
  });

  it(`should return error if date is more than ${AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_PAST} days in the past`, () => {
    // Arrange
    const effectiveFrom = sub(today, { days: AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_PAST + 1 });
    const coverStartDate = sub(today, { years: 1 });

    // Act
    const result = validateAndParseEffectiveFrom(getFormattedDate(effectiveFrom), coverStartDate);

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: valueRef,
          errMsg: `The date entered is invalid. Please ensure the date entered does not exceed the allowable timeframe`,
          subFieldErrorRefs: ['effectiveFrom-day', 'effectiveFrom-month', 'effectiveFrom-year'],
        },
      ],
    });
  });

  it('should return effective from date if it is the same as the cover start date', () => {
    // Act
    const result = validateAndParseEffectiveFrom(getFormattedDate(today), today);

    // Assert
    expect(result).toEqual({
      value: getUnixTime(today),
    });
  });

  it(`should return effective from date if it is exactly ${AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_PAST} days in the past`, () => {
    // Arrange
    const effectiveFrom = sub(today, { days: AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_PAST });
    const coverStartDate = sub(today, { years: 1 });
    // Act
    const result = validateAndParseEffectiveFrom(getFormattedDate(effectiveFrom), coverStartDate);

    // Assert
    expect(result).toEqual({
      value: getUnixTime(effectiveFrom),
    });
  });

  it(`should return effective from date if it is exactly ${AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_FUTURE} days in the future`, () => {
    // Arrange
    const effectiveFrom = add(today, { days: AMENDMENT_MAXIMUM_EFFECTIVE_FROM_DAYS_IN_FUTURE });
    const coverStartDate = add(today, { days: 1 });
    // Act
    const result = validateAndParseEffectiveFrom(getFormattedDate(effectiveFrom), coverStartDate);

    // Assert
    expect(result).toEqual({
      value: getUnixTime(effectiveFrom),
    });
  });
});

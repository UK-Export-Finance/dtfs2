import { applyStandardValidationAndParseDateInput, COVER_END_DATE_MAXIMUM_YEARS_IN_FUTURE, DayMonthYearInput } from '@ukef/dtfs2-common';
import { add, format, startOfDay, getUnixTime } from 'date-fns';
import { validateAndParseCoverEndDate } from './validation';
import { mapValidationError } from '../../../utils/map-validation-error';

const valueName = 'cover end date';
const valueRef = 'coverEndDate';

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
    const response = validateAndParseCoverEndDate(dayMonthYear, new Date());

    // Assert
    expect(response).toEqual({
      errors: [mapValidationError(applyStandardValidationAndParseDateInput(dayMonthYear, valueName, valueRef).error!)],
    });
  });

  it('should return error if date is before cover start date', () => {
    // Arrange
    const coverEndDate = new Date();
    const coverStartDate = add(new Date(), { days: 1 });

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
    const coverEndDate = add(new Date(), { years: 6, days: 1 });
    const coverStartDate = add(new Date(), { days: 1 });

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

  it('should return cover end date if valid', () => {
    // Arrange
    const coverEndDate = startOfDay(add(new Date(), { years: 1 }));
    const coverStartDate = add(new Date(), { days: 1 });

    // Act
    const result = validateAndParseCoverEndDate(getFormattedDate(coverEndDate), coverStartDate);

    // Assert
    expect(result).toEqual({
      value: getUnixTime(coverEndDate),
    });
  });
});

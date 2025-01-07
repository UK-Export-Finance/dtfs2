import { applyStandardValidationAndParseDateInput } from '@ukef/dtfs2-common';
import { add, startOfDay } from 'date-fns';
import { validateAndParseFacilityEndDate } from './validation';

const valueName = 'facility end date';
const valueRef = 'facilityEndDate';

describe('validateAndParseFacilityEndDate', () => {
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
    const response = validateAndParseFacilityEndDate(dayMonthYear, new Date());

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
    const facilityEndDate = new Date();
    const coverStartDate = add(new Date(), { days: 1 });

    // Act
    const result = validateAndParseFacilityEndDate(
      { day: facilityEndDate.getDate().toString(), month: (facilityEndDate.getMonth() + 1).toString(), year: facilityEndDate.getFullYear().toString() },
      coverStartDate,
    );

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: valueRef,
          errMsg: 'Facility end date cannot be before the cover start date',
          subFieldErrorRefs: ['facilityEndDate-day', 'facilityEndDate-month', 'facilityEndDate-year'],
        },
      ],
    });
  });

  it('returns error if date is 6 years in the future', () => {
    // Arrange
    const facilityEndDate = add(new Date(), { years: 6, days: 1 });
    const coverStartDate = add(new Date(), { days: 1 });

    // Act
    const result = validateAndParseFacilityEndDate(
      { day: facilityEndDate.getDate().toString(), month: (facilityEndDate.getMonth() + 1).toString(), year: facilityEndDate.getFullYear().toString() },
      coverStartDate,
    );

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: valueRef,
          errMsg: 'Facility end date cannot be greater than 6 years in the future',
          subFieldErrorRefs: ['facilityEndDate-day', 'facilityEndDate-month', 'facilityEndDate-year'],
        },
      ],
    });
  });

  it('returns date if valid', () => {
    // Arrange
    const facilityEndDate = startOfDay(add(new Date(), { years: 1 }));
    const coverStartDate = add(new Date(), { days: 1 });

    // Act
    const result = validateAndParseFacilityEndDate(
      { day: facilityEndDate.getDate().toString(), month: (facilityEndDate.getMonth() + 1).toString(), year: facilityEndDate.getFullYear().toString() },
      coverStartDate,
    );

    // Assert
    expect(result).toEqual({
      date: facilityEndDate,
    });
  });
});

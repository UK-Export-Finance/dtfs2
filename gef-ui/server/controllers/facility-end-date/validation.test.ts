import { add } from 'date-fns';
import { validateAndParseDayMonthYear } from '../../utils/day-month-year-validation';
import { validateAndParseFacilityEndDate } from './validation';

jest.mock('../../utils/day-month-year-validation');

const mockValidateAndParseDayMonthYear = validateAndParseDayMonthYear as unknown as jest.Mock;

describe('validateAndParseFacilityEndDate', () => {
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
    validateAndParseFacilityEndDate(dayMonthYear, new Date());

    // Assert
    expect(validateAndParseDayMonthYear).toHaveBeenCalledWith(dayMonthYear, {
      errRef: 'facilityEndDate',
      variableDisplayName: 'facility end date',
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
    const result = validateAndParseFacilityEndDate(dayMonthYear, new Date());

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: 'facilityEndDate',
          errMsg: 'Facility end date must be in the correct format DD/MM/YYYY',
          subFieldErrorRefs: ['day', 'year', 'month'],
        },
      ],
    });
  });

  it('returns error if date is before cover start date', () => {
    // Arrange
    const facilityEndDate = new Date();
    const coverStartDate = add(new Date(), { days: 1 });

    mockValidateAndParseDayMonthYear.mockReturnValueOnce({
      date: facilityEndDate,
    });

    // Act
    const result = validateAndParseFacilityEndDate(
      { day: facilityEndDate.getDate().toString(), month: (facilityEndDate.getMonth() + 1).toString(), year: facilityEndDate.getFullYear().toString() },
      coverStartDate,
    );

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: 'facilityEndDate',
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

    mockValidateAndParseDayMonthYear.mockReturnValueOnce({
      date: facilityEndDate,
    });

    // Act
    const result = validateAndParseFacilityEndDate(
      { day: facilityEndDate.getDate().toString(), month: (facilityEndDate.getMonth() + 1).toString(), year: facilityEndDate.getFullYear().toString() },
      coverStartDate,
    );

    // Assert
    expect(result).toEqual({
      errors: [
        {
          errRef: 'facilityEndDate',
          errMsg: 'Facility end date cannot be greater than 6 years in the future',
          subFieldErrorRefs: ['facilityEndDate-day', 'facilityEndDate-month', 'facilityEndDate-year'],
        },
      ],
    });
  });

  it('returns date if valid', () => {
    // Arrange
    const facilityEndDate = add(new Date(), { years: 1 });
    const coverStartDate = add(new Date(), { days: 1 });

    mockValidateAndParseDayMonthYear.mockReturnValueOnce({
      date: facilityEndDate,
    });

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

import { add, getUnixTime } from 'date-fns';
import facilityEndDateValidation from './amendmentFacilityEndDate.validate';

const testCoverStartDate = getUnixTime(new Date(2025, 7, 4)) * 1000;

describe('facilityEndDateValidation()', () => {
  it('should return an error if the facility end date is greater than 6 years in the future', () => {
    const testFacilityEndDate = add(new Date(), { years: 6, days: 1 });
    const result = facilityEndDateValidation(
      {
        'facility-end-date-day': testFacilityEndDate.getDate(),
        'facility-end-date-month': testFacilityEndDate.getMonth() + 1,
        'facility-end-date-year': testFacilityEndDate.getFullYear(),
      },
      testCoverStartDate,
    );
    const expected = {
      summary: [
        {
          text: 'Facility end date cannot be greater than 6 years in the future',
        },
      ],
      fields: ['facilityEndDate'],
    };

    expect(result.errorsObject.errors).toEqual(expected);
  });

  it('should not return an error if the facility end date is less than 6 years in the future', () => {
    const testFacilityEndDate = add(new Date(), { years: 6, days: -1 });
    const result = facilityEndDateValidation(
      {
        'facility-end-date-day': testFacilityEndDate.getDate(),
        'facility-end-date-month': testFacilityEndDate.getMonth() + 1,
        'facility-end-date-year': testFacilityEndDate.getFullYear(),
      },
      testCoverStartDate,
    );

    expect(result.errorsObject).toEqual({});
  });

  it('should return an error if the facility end date is before the cover start date', () => {
    const result = facilityEndDateValidation(
      {
        'facility-end-date-day': 2,
        'facility-end-date-month': 8,
        'facility-end-date-year': 2025,
      },
      testCoverStartDate,
    );
    const expected = {
      summary: [
        {
          text: 'The facility end date cannot be before the cover start date',
        },
      ],
      fields: ['facilityEndDate'],
    };

    expect(result.errorsObject.errors).toEqual(expected);
  });

  it('should return an error if a field is left blank', () => {
    const result = facilityEndDateValidation(
      {
        'facility-end-date-day': null,
        'facility-end-date-month': 8,
        'facility-end-date-year': 2025,
      },
      testCoverStartDate,
    );
    const expected = {
      summary: [
        {
          text: 'Facility end date must include a day',
        },
      ],
      fields: ['facilityEndDateDay'],
    };

    expect(result.errorsObject.errors).toEqual(expected);
  });

  it('should return an error if nothing is entered', () => {
    const result = facilityEndDateValidation(
      {
        'facility-end-date-day': null,
        'facility-end-date-month': null,
        'facility-end-date-year': null,
      },
      testCoverStartDate,
    );
    const expected = {
      summary: [
        {
          text: 'Enter the Facility end date',
        },
      ],
      fields: ['facilityEndDate'],
    };

    expect(result.errorsObject.errors).toEqual(expected);
  });

  it('should return an error if a field in the correct format is entered', () => {
    const result = facilityEndDateValidation(
      {
        'facility-end-date-day': 12,
        'facility-end-date-month': 12,
        'facility-end-date-year': 20255,
      },
      testCoverStartDate,
    );
    const expected = {
      summary: [
        {
          text: 'Facility end date must be a real date',
        },
      ],
      fields: ['facilityEndDateYear'],
    };

    expect(result.errorsObject.errors).toEqual(expected);
  });

  it('should return no errors and a correctly formatted facility date if all fields are entered correctly', () => {
    const result = facilityEndDateValidation(
      {
        'facility-end-date-day': 12,
        'facility-end-date-month': 12,
        'facility-end-date-year': 2025,
      },
      testCoverStartDate,
    );
    const expected = {
      errorsObject: {},
      facilityEndDate: getUnixTime(new Date(2025, 11, 12, 0, 0, 0)),
    };

    expect(result).toEqual(expected);
  });
});

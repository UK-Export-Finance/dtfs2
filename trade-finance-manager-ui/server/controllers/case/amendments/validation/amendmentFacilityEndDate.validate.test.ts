import { add } from 'date-fns';
import { facilityEndDateValidation } from './amendmentFacilityEndDate.validate';

const testCoverStartDate = new Date(2025, 7, 4);

describe('facilityEndDateValidation()', () => {
  it('should return an error if the facility end date is greater than 6 years in the future', () => {
    const testFacilityEndDate = add(new Date(), { years: 6, days: 1 });
    const result = facilityEndDateValidation(
      {
        day: testFacilityEndDate.getDate().toString(),
        month: (testFacilityEndDate.getMonth() + 1).toString(),
        year: testFacilityEndDate.getFullYear().toString(),
      },
      testCoverStartDate,
    );
    const expectedError = {
      summary: [
        {
          text: 'Facility end date cannot be greater than 6 years in the future',
        },
      ],
      fields: ['facility-end-date-day', 'facility-end-date-month', 'facility-end-date-year'],
    };

    expect(result.error).toEqual(expectedError);
  });

  it('should not return an error if the facility end date is less than 6 years in the future', () => {
    const testFacilityEndDate = add(new Date(), { years: 6, days: -1 });
    const result = facilityEndDateValidation(
      {
        day: testFacilityEndDate.getDate().toString(),
        month: (testFacilityEndDate.getMonth() + 1).toString(),
        year: testFacilityEndDate.getFullYear().toString(),
      },
      testCoverStartDate,
    );

    expect(result.error).toEqual(null);
  });

  it('should return an error if the facility end date is before the cover start date', () => {
    const result = facilityEndDateValidation(
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
          text: 'The facility end date cannot be before the cover start date',
        },
      ],
      fields: ['facility-end-date-day', 'facility-end-date-month', 'facility-end-date-year'],
    };

    expect(result.error).toEqual(expectedError);
  });

  it('should return an error if a field is left blank', () => {
    const result = facilityEndDateValidation(
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
          text: 'Facility end date must include a day',
        },
      ],
      fields: ['facility-end-date-day'],
    };

    expect(result.error).toEqual(expectedError);
  });

  it('should return an error if nothing is entered', () => {
    const result = facilityEndDateValidation(
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
          text: 'Enter the facility end date',
        },
      ],
      fields: ['facility-end-date-day', 'facility-end-date-month', 'facility-end-date-year'],
    };

    expect(result.error).toEqual(expectedError);
  });

  it('should return an error if a field in the incorrect format is entered', () => {
    const result = facilityEndDateValidation(
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
          text: 'Facility end date must be a real date',
        },
      ],
      fields: ['facility-end-date-year'],
    };

    expect(result.error).toEqual(expectedError);
  });

  it('should return no errors and a correctly formatted facility date if all fields are entered correctly', () => {
    const result = facilityEndDateValidation(
      {
        day: '12',
        month: '12',
        year: '2025',
      },
      testCoverStartDate,
    );
    const expected = {
      error: null,
      facilityEndDate: new Date(2025, 11, 12, 0, 0, 0),
    };

    expect(result).toEqual(expected);
  });
});

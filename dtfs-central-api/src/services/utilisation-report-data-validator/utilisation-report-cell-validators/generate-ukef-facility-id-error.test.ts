import { generateUkefFacilityIdError } from './generate-ukef-facility-id-error';

describe('generateUkefFacilityIdError', () => {
  const testExporterName = 'test exporter';
  it('returns an error when the value is missing', () => {
    const nullFacilityId = {
      value: null,
      column: 'Z',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'UKEF facility ID must have an entry',
      column: 'Z',
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const ukefFacilityIdError = generateUkefFacilityIdError(nullFacilityId, testExporterName);

    expect(ukefFacilityIdError).toEqual(expectedError);
  });

  it('returns an error when the value is not a valid UKEF Facility ID', () => {
    const invalidFacilityId = {
      value: '1234567',
      column: 'Z',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'UKEF facility ID must be an 8 to 10 digit number',
      column: 'Z',
      row: 1,
      value: '1234567',
      exporter: testExporterName,
    };

    const ukefFacilityIdError = generateUkefFacilityIdError(invalidFacilityId, testExporterName);

    expect(ukefFacilityIdError).toEqual(expectedError);
  });

  it('returns null if the value is a valid UKEF Facility ID', () => {
    const validFacilityId = {
      value: '12345678',
      column: 'Z',
      row: 1,
    };

    const ukefFacilityIdError = generateUkefFacilityIdError(validFacilityId);

    expect(ukefFacilityIdError).toBeNull();
  });

  it('returns the correct column and row when an error is found', () => {
    const invalidFacilityIdWithDifferentRowAndColumn = {
      value: '1234567',
      column: 'Y',
      row: 3,
    };
    const expectedError = {
      errorMessage: 'UKEF facility ID must be an 8 to 10 digit number',
      column: 'Y',
      row: 3,
      value: '1234567',
      exporter: testExporterName,
    };

    const ukefFacilityIdError = generateUkefFacilityIdError(invalidFacilityIdWithDifferentRowAndColumn, testExporterName);

    expect(ukefFacilityIdError).toEqual(expectedError);
  });
});

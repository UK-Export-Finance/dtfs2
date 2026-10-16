import { generateUkefFacilityIdError } from './generate-ukef-facility-id-error';

describe('generateUkefFacilityIdError', () => {
  const testExporterName = 'test exporter';

  it('returns an error when the value is missing', () => {
    // Arrange
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

    // Act
    const ukefFacilityIdError = generateUkefFacilityIdError(nullFacilityId, testExporterName);

    // Assert
    expect(ukefFacilityIdError).toEqual(expectedError);
  });

  it('returns an error when the value is not an 8 to 10 digit string', () => {
    // Arrange
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

    // Act
    const ukefFacilityIdError = generateUkefFacilityIdError(invalidFacilityId, testExporterName);

    // Assert
    expect(ukefFacilityIdError).toEqual(expectedError);
  });

  it('returns an error when the value could not be found in the TFM facilities collection', () => {
    // Arrange
    const facilityIdValue = '12345678';

    const validFacilityId = {
      value: facilityIdValue,
      column: 'Z',
      row: 1,
      ukefFacilityIdMatches: false,
    };
    const expectedError = {
      errorMessage: 'The facility ID has not been recognised. Enter a facility ID for a general export facility.',
      column: 'Z',
      row: 1,
      value: facilityIdValue,
      exporter: testExporterName,
    };

    // Act
    const ukefFacilityIdError = generateUkefFacilityIdError(validFacilityId, testExporterName);

    // Assert
    expect(ukefFacilityIdError).toEqual(expectedError);
  });

  it('returns null if the value is a valid UKEF GEF Facility ID', () => {
    // Arrange
    const facilityIdValue = '12345678';

    const validFacilityId = {
      value: facilityIdValue,
      column: 'Z',
      row: 1,
    };

    // Act
    const ukefFacilityIdError = generateUkefFacilityIdError({ ...validFacilityId, ukefFacilityIdMatches: true });

    // Assert
    expect(ukefFacilityIdError).toBeNull();
  });

  it('returns the correct column and row when an error is found', () => {
    // Arrange
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

    // Act
    const ukefFacilityIdError = generateUkefFacilityIdError(invalidFacilityIdWithDifferentRowAndColumn, testExporterName);

    // Assert
    expect(ukefFacilityIdError).toEqual(expectedError);
  });
});

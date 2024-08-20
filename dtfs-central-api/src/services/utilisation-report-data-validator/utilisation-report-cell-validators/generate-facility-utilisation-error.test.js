const { generateFacilityUtilisationError } = require('./generate-facility-utilisation-error');
const { FILE_UPLOAD } = require('../../../constants/file-upload');

describe('generateFacilityUtilisationError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is missing', async () => {
    const nullFacilityUtilisation = {
      value: null,
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Facility utilisation must have an entry',
      column: 1,
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const facilityUtilisationError = generateFacilityUtilisationError(nullFacilityUtilisation, testExporterName);

    expect(facilityUtilisationError).toEqual(expectedError);
  });

  it('returns an error when the value is not a number', async () => {
    const invalidFacilityUtilisation = {
      value: 'abc',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Facility utilisation must be a number with a maximum of two decimal places',
      column: 1,
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const facilityUtilisationError = generateFacilityUtilisationError(invalidFacilityUtilisation, testExporterName);

    expect(facilityUtilisationError).toEqual(expectedError);
  });

  it('returns an error when the value has more than 2 decimal places', async () => {
    const invalidFacilityUtilisation = {
      value: '0.123',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Facility utilisation must be a number with a maximum of two decimal places',
      column: 1,
      row: 1,
      value: '0.123',
      exporter: testExporterName,
    };

    const facilityUtilisationError = generateFacilityUtilisationError(invalidFacilityUtilisation, testExporterName);

    expect(facilityUtilisationError).toEqual(expectedError);
  });

  it('returns an error when the value is too long', async () => {
    const invalidFacilityUtilisation = {
      value: '1473812445951826593.52',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: `Facility utilisation must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 1,
      row: 1,
      value: '1473812445951826593.52',
      exporter: testExporterName,
    };

    const facilityUtilisationError = generateFacilityUtilisationError(invalidFacilityUtilisation, testExporterName);

    expect(facilityUtilisationError).toEqual(expectedError);
  });

  it('returns null if the value is a valid facility utilisation', async () => {
    const validFacilityUtilisation = {
      value: '1000000',
      column: 1,
      row: 1,
    };

    const facilityUtilisationError = generateFacilityUtilisationError(validFacilityUtilisation, testExporterName);

    expect(facilityUtilisationError).toEqual(null);
  });
});

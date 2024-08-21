import { generateFacilityUtilisationError } from './generate-facility-utilisation-error';
import { FILE_UPLOAD } from '../../../constants/file-upload';

describe('generateFacilityUtilisationError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is missing', () => {
    const nullFacilityUtilisation = {
      value: null,
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Facility utilisation must have an entry',
      column: 'A',
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const facilityUtilisationError = generateFacilityUtilisationError(nullFacilityUtilisation, testExporterName);

    expect(facilityUtilisationError).toEqual(expectedError);
  });

  it('returns an error when the value is not a number', () => {
    const invalidFacilityUtilisation = {
      value: 'abc',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Facility utilisation must be a number with a maximum of two decimal places',
      column: 'A',
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const facilityUtilisationError = generateFacilityUtilisationError(invalidFacilityUtilisation, testExporterName);

    expect(facilityUtilisationError).toEqual(expectedError);
  });

  it('returns an error when the value has more than 2 decimal places', () => {
    const invalidFacilityUtilisation = {
      value: '0.123',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Facility utilisation must be a number with a maximum of two decimal places',
      column: 'A',
      row: 1,
      value: '0.123',
      exporter: testExporterName,
    };

    const facilityUtilisationError = generateFacilityUtilisationError(invalidFacilityUtilisation, testExporterName);

    expect(facilityUtilisationError).toEqual(expectedError);
  });

  it('returns an error when the value is too long', () => {
    const invalidFacilityUtilisation = {
      value: '1473812445951826593.52',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: `Facility utilisation must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 'A',
      row: 1,
      value: '1473812445951826593.52',
      exporter: testExporterName,
    };

    const facilityUtilisationError = generateFacilityUtilisationError(invalidFacilityUtilisation, testExporterName);

    expect(facilityUtilisationError).toEqual(expectedError);
  });

  it('returns null if the value is a valid facility utilisation', () => {
    const validFacilityUtilisation = {
      value: '1000000',
      column: 'A',
      row: 1,
    };

    const facilityUtilisationError = generateFacilityUtilisationError(validFacilityUtilisation, testExporterName);

    expect(facilityUtilisationError).toEqual(null);
  });
});

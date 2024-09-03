import { when } from 'jest-when';
import { generateUkefFacilityIdError } from './generate-ukef-facility-id-error';
import { FacilityUtilisationDataRepo } from '../../../repositories/facility-utilisation-data-repo';

describe('generateUkefFacilityIdError', () => {
  const testExporterName = 'test exporter';

  const facilityUtilisationDataExistsSpy = jest.spyOn(FacilityUtilisationDataRepo, 'existsById');

  beforeEach(() => {
    facilityUtilisationDataExistsSpy.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns an error when the value is missing', async () => {
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
    const ukefFacilityIdError = await generateUkefFacilityIdError(nullFacilityId, testExporterName);

    // Assert
    expect(ukefFacilityIdError).toEqual(expectedError);
  });

  it('returns an error when the value is not a valid UKEF Facility ID', async () => {
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
    const ukefFacilityIdError = await generateUkefFacilityIdError(invalidFacilityId, testExporterName);

    // Assert
    expect(ukefFacilityIdError).toEqual(expectedError);
  });

  it('returns an error when the value could not be found in the facility utilisation data table', async () => {
    // Arrange
    const validFacilityId = {
      value: '12345678',
      column: 'Z',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'The Facility ID has not been recognised. Enter a valid Facility ID between 8 and 10 characters.',
      column: 'Z',
      row: 1,
      value: '12345678',
      exporter: testExporterName,
    };

    when(facilityUtilisationDataExistsSpy).calledWith('12345678').mockResolvedValue(false);

    // Act
    const ukefFacilityIdError = await generateUkefFacilityIdError(validFacilityId, testExporterName);

    // Assert
    expect(ukefFacilityIdError).toEqual(expectedError);
  });

  it('returns null if the value is a valid UKEF Facility ID', async () => {
    // Arrange
    const validFacilityId = {
      value: '12345678',
      column: 'Z',
      row: 1,
    };

    // Act
    const ukefFacilityIdError = await generateUkefFacilityIdError(validFacilityId);

    // Assert
    expect(ukefFacilityIdError).toBeNull();
  });

  it('it returns the correct column and row when an error is found', async () => {
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
    const ukefFacilityIdError = await generateUkefFacilityIdError(invalidFacilityIdWithDifferentRowAndColumn, testExporterName);

    // Assert
    expect(ukefFacilityIdError).toEqual(expectedError);
  });
});

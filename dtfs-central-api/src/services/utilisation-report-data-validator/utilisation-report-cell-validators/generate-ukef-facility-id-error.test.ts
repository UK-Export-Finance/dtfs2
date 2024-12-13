import { when } from 'jest-when';
import { generateUkefFacilityIdError } from './generate-ukef-facility-id-error';
import { TfmFacilitiesRepo } from '../../../repositories/tfm-facilities-repo';

describe('generateUkefFacilityIdError', () => {
  const testExporterName = 'test exporter';

  const gefFacilityExistsSpy = jest.spyOn(TfmFacilitiesRepo, 'ukefGefFacilityExists');

  beforeEach(() => {
    gefFacilityExistsSpy.mockResolvedValue(true);
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
    expect(gefFacilityExistsSpy).not.toHaveBeenCalled();
  });

  it('returns an error when the value is not an 8 to 10 digit string', async () => {
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
    expect(gefFacilityExistsSpy).not.toHaveBeenCalled();
  });

  it('returns an error when the value could not be found in the TFM facilities collection', async () => {
    // Arrange
    const facilityIdValue = '12345678';

    const validFacilityId = {
      value: facilityIdValue,
      column: 'Z',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'The facility ID has not been recognised. Enter a facility ID for a general export facility.',
      column: 'Z',
      row: 1,
      value: facilityIdValue,
      exporter: testExporterName,
    };

    when(gefFacilityExistsSpy).calledWith(facilityIdValue).mockResolvedValue(false);

    // Act
    const ukefFacilityIdError = await generateUkefFacilityIdError(validFacilityId, testExporterName);

    // Assert
    expect(ukefFacilityIdError).toEqual(expectedError);
    expect(gefFacilityExistsSpy).toHaveBeenCalledTimes(1);
    expect(gefFacilityExistsSpy).toHaveBeenCalledWith(facilityIdValue);
  });

  it('returns null if the value is a valid UKEF GEF Facility ID', async () => {
    // Arrange
    const facilityIdValue = '12345678';

    const validFacilityId = {
      value: facilityIdValue,
      column: 'Z',
      row: 1,
    };

    // Act
    const ukefFacilityIdError = await generateUkefFacilityIdError(validFacilityId);

    // Assert
    expect(ukefFacilityIdError).toBeNull();
    expect(gefFacilityExistsSpy).toHaveBeenCalledTimes(1);
    expect(gefFacilityExistsSpy).toHaveBeenCalledWith(facilityIdValue);
  });

  it('returns the correct column and row when an error is found', async () => {
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
    expect(gefFacilityExistsSpy).not.toHaveBeenCalled();
  });
});

import { getKeyingSheetCalculationFacilityValues } from './get-keying-sheet-calculation-facility-values';
import { TfmFacilitiesRepo } from '../repositories/tfm-facilities-repo';
import { NotFoundError } from '../errors';
import { aTfmFacility, aFacility } from '../../test-helpers';

jest.mock('../repositories/tfm-facilities-repo');

describe('getKeyingSheetCalculationFacilityValues', () => {
  const findOneByUkefFacilityIdSpy = jest.spyOn(TfmFacilitiesRepo, 'findOneByUkefFacilityId');
  const facilityId = '123';

  const mockFacility = {
    ...aTfmFacility(),
    facilitySnapshot: {
      ...aFacility(),
      ukefFacilityId: facilityId,
      coverPercentage: 5,
    },
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when a tfm facility with the supplied facility id cannot be found', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue(null);
    });

    it('should throw a NotFoundError', async () => {
      await expect(getKeyingSheetCalculationFacilityValues(facilityId)).rejects.toThrow(
        new NotFoundError(`TFM facility with ukefFacilityId '${facilityId}' could not be found`),
      );
    });
  });

  describe('when a tfm facility with the supplied facility id can be found', () => {
    beforeEach(() => {
      findOneByUkefFacilityIdSpy.mockResolvedValue(mockFacility);
    });

    it('should return a populated object', async () => {
      const result = await getKeyingSheetCalculationFacilityValues(facilityId);

      const expected = {
        coverPercentage: mockFacility.facilitySnapshot.coverPercentage,
        value: mockFacility.facilitySnapshot.value,
      };

      expect(result).toEqual(expected);
    });
  });
});

import { GEF_FACILITY_TYPE, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from './tfm-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';

const getCollectionMock = jest.fn();
const countMock = jest.fn();

describe('TfmFacilitiesRepo.ukefGefFacilityExists', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    countMock.mockResolvedValue(0);
    jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
    getCollectionMock.mockResolvedValue({ count: countMock });
  });

  it('should query the TFM facilities collection for the ID and only GEF facility types', async () => {
    // Arrange
    const ukefFacilityId = '12345678';

    // Act
    await TfmFacilitiesRepo.ukefGefFacilityExists(ukefFacilityId);

    // Assert
    expect(getCollectionMock).toHaveBeenCalledTimes(1);
    expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    expect(countMock).toHaveBeenCalledTimes(1);
    expect(countMock).toHaveBeenCalledWith({
      'facilitySnapshot.ukefFacilityId': { $eq: ukefFacilityId },
      'facilitySnapshot.type': { $in: Object.values(GEF_FACILITY_TYPE) },
    });
  });

  it('should return true when a matching GEF facility is found', async () => {
    // Arrange
    countMock.mockResolvedValueOnce(1);

    // Act
    const result = await TfmFacilitiesRepo.ukefGefFacilityExists('12345678');

    // Assert
    expect(result).toBe(true);
  });

  it('should return true when multiple matching GEF facilities are found', async () => {
    // Arrange
    countMock.mockResolvedValueOnce(2);

    // Act
    const result = await TfmFacilitiesRepo.ukefGefFacilityExists('12345678');

    // Assert
    expect(result).toBe(true);
  });

  it('should return false when no matching GEF facility is found', async () => {
    // Act
    const result = await TfmFacilitiesRepo.ukefGefFacilityExists('12345678');

    // Assert
    expect(result).toBe(false);
  });
});

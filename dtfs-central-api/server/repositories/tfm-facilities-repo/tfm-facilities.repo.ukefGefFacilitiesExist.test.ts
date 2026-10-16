import { GEF_FACILITY_TYPE, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from './tfm-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';

const getCollectionMock = jest.fn();
const findMock = jest.fn();
const toArrayMock = jest.fn();

describe('TfmFacilitiesRepo.ukefGefFacilitiesExist', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    toArrayMock.mockResolvedValue([]);
    findMock.mockReturnValue({ toArray: toArrayMock });
    jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
    getCollectionMock.mockResolvedValue({ find: findMock });
  });

  it('should return an empty record without querying the database when no IDs are provided', async () => {
    // Act
    const result = await TfmFacilitiesRepo.ukefGefFacilitiesExist([]);

    // Assert
    expect(result).toEqual({});
    expect(getCollectionMock).not.toHaveBeenCalled();
    expect(findMock).not.toHaveBeenCalled();
  });

  it('should query for all supplied IDs and only GEF facility types in one projected find', async () => {
    // Arrange
    const facilityIds = ['12345678', '87654321'];

    // Act
    await TfmFacilitiesRepo.ukefGefFacilitiesExist(facilityIds);

    // Assert
    expect(getCollectionMock).toHaveBeenCalledTimes(1);
    expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith(
      {
        'facilitySnapshot.ukefFacilityId': { $in: facilityIds },
        'facilitySnapshot.type': { $in: Object.values(GEF_FACILITY_TYPE) },
      },
      { projection: { _id: 0, 'facilitySnapshot.ukefFacilityId': 1 } },
    );
    expect(toArrayMock).toHaveBeenCalledTimes(1);
  });

  it('should return true for matched IDs and false for unmatched IDs', async () => {
    // Arrange
    toArrayMock.mockResolvedValueOnce([{ facilitySnapshot: { ukefFacilityId: '12345678' } }]);

    // Act
    const result = await TfmFacilitiesRepo.ukefGefFacilitiesExist(['12345678', '87654321']);

    // Assert
    expect(result).toEqual({ '12345678': true, '87654321': false });
  });

  it('should return false for every ID when no matching facilities are found', async () => {
    // Act
    const result = await TfmFacilitiesRepo.ukefGefFacilitiesExist(['12345678', '87654321']);

    // Assert
    expect(result).toEqual({ '12345678': false, '87654321': false });
  });

  it('should return true if multiple documents match the same ID and handle duplicate input IDs', async () => {
    // Arrange
    toArrayMock.mockResolvedValueOnce([{ facilitySnapshot: { ukefFacilityId: '12345678' } }, { facilitySnapshot: { ukefFacilityId: '12345678' } }]);

    // Act
    const result = await TfmFacilitiesRepo.ukefGefFacilitiesExist(['12345678', '12345678', '87654321']);

    // Assert
    expect(result).toEqual({ '12345678': true, '87654321': false });
    expect(findMock).toHaveBeenCalledTimes(1);
  });
});

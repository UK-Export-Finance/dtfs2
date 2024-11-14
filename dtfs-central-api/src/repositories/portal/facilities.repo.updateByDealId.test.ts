import { ObjectId } from 'mongodb';
import { Facility, FACILITY_STAGE, InvalidDealIdError, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';
import { PortalFacilityRepo } from './facilities.repo';

describe('PortalFacilityRepo', () => {
  const updateManyMock = jest.fn();
  const getCollectionMock = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(1727876437063);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('updateByDealId', () => {
    const dealId = new ObjectId();
    const update: Partial<Facility> = { facilityStage: FACILITY_STAGE.RISK_EXPIRED };
    const auditDetails = generateSystemAuditDetails();

    beforeEach(() => {
      jest.resetAllMocks();

      getCollectionMock.mockResolvedValue({
        updateMany: updateManyMock,
      });

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
    });

    it(`calls getCollection with ${MONGO_DB_COLLECTIONS.FACILITIES}`, async () => {
      // Act
      await PortalFacilityRepo.updateByDealId(dealId, update, auditDetails);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.FACILITIES);
    });

    it('calls updateMany with the expected parameters', async () => {
      // Act
      await PortalFacilityRepo.updateByDealId(dealId, update, auditDetails);

      // Assert
      const expectedFilter = { dealId: { $eq: dealId } };
      const expectedUpdate = {
        ...update,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      };
      expect(updateManyMock).toHaveBeenCalledTimes(1);
      expect(updateManyMock).toHaveBeenCalledWith(expectedFilter, expectedUpdate);
    });

    it('throws InvalidDealIdError if the dealId is not a valid ObjectId', async () => {
      // Arrange
      const invalidDealId = 'invalidDealId';

      // Act + Assert
      await expect(async () => await PortalFacilityRepo.updateByDealId(invalidDealId, update, auditDetails)).rejects.toThrow(InvalidDealIdError);
    });
  });
});

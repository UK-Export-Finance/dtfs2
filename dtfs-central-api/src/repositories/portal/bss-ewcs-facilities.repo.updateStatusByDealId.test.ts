import { ObjectId } from 'mongodb';
import { FACILITY_STATUS, FACILITY_TYPE, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { PortalBssEwcsFacilityRepo } from './bss-ewcs-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';

describe('PortalBssEwcsFacilityRepo', () => {
  const updateManyMock = jest.fn();
  const getCollectionMock = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(1727876437063);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('updateStatusByDealId', () => {
    const dealId = new ObjectId();
    const status = FACILITY_STATUS.RISK_EXPIRED;
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
      await PortalBssEwcsFacilityRepo.updateStatusByDealId(dealId, status, auditDetails);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.FACILITIES);
    });

    it('calls updateMany with the expected parameters', async () => {
      // Act
      await PortalBssEwcsFacilityRepo.updateStatusByDealId(dealId, status, auditDetails);

      // Assert
      const expectedFilter = { dealId: { $eq: dealId }, type: { $in: [FACILITY_TYPE.BOND, FACILITY_TYPE.LOAN] } };
      const expectedUpdate = {
        $set: {
          status,
          auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
          previousStatus: '$status',
          updatedAt: Date.now(),
        },
      };
      expect(updateManyMock).toHaveBeenCalledTimes(1);
      expect(updateManyMock).toHaveBeenCalledWith(expectedFilter, expectedUpdate);
    });
  });
});

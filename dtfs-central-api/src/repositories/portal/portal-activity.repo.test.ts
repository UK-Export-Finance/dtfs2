import { ObjectId } from 'mongodb';
import { InvalidDealIdError, MONGO_DB_COLLECTIONS, PortalActivity, PORTAL_ACTIVITY_LABEL } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { getUnixTime } from 'date-fns';
import { mongoDbClient } from '../../drivers/db-client';
import { PortalActivityRepo } from './portal-activity.repo';

describe('PortalActivityRepo', () => {
  const updateOneMock = jest.fn();
  const getCollectionMock = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date());
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('addPortalActivity', () => {
    const dealId = new ObjectId();

    const newActivity: PortalActivity = {
      label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
      timestamp: getUnixTime(new Date()),
      author: {
        _id: '123',
        firstName: 'First name',
      },
    };

    const auditDetails = generateSystemAuditDetails();

    beforeEach(() => {
      jest.resetAllMocks();

      getCollectionMock.mockResolvedValue({
        updateOne: updateOneMock,
      });

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
    });

    it(`should call getCollection with ${MONGO_DB_COLLECTIONS.DEALS}`, async () => {
      // Act
      await PortalActivityRepo.addPortalActivity(dealId, newActivity, auditDetails);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.DEALS);
    });

    it('should call updateOne with the expected parameters', async () => {
      // Act
      await PortalActivityRepo.addPortalActivity(dealId, newActivity, auditDetails);

      // Assert
      const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

      const expectedIdFilter = { _id: { $eq: dealId } };

      const expectedUpdate = {
        $push: {
          portalActivities: { $each: [newActivity], $position: 0 },
        },
        $set: { auditRecord },
      };

      expect(updateOneMock).toHaveBeenCalledTimes(1);
      expect(updateOneMock).toHaveBeenCalledWith(expectedIdFilter, expectedUpdate);
    });

    it('should throw InvalidDealIdError if the dealId is not a valid ObjectId', async () => {
      // Arrange
      const invalidDealId = 'invalidDealId';

      // Act + Assert
      await expect(async () => await PortalActivityRepo.addPortalActivity(invalidDealId, newActivity, auditDetails)).rejects.toThrow(InvalidDealIdError);
    });
  });
});

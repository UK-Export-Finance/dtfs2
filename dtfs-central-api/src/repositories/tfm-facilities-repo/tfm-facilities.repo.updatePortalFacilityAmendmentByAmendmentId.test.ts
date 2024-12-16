import { ObjectId, UpdateResult } from 'mongodb';
import { flatten } from 'mongo-dot-notation';
import { MONGO_DB_COLLECTIONS, AMENDMENT_TYPES, AmendmentNotFoundError } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { TfmFacilitiesRepo } from './tfm-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';
import { aPortalUser } from '../../../test-helpers';

const mockGetCollection = jest.fn();
const mockUpdateOne = jest.fn() as jest.Mock<Promise<UpdateResult>>;

const facilityId = new ObjectId();

const update = {
  changeFacilityValue: true,
};
const amendmentId = new ObjectId().toString();
const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

const mockUpdateResult = {
  modifiedCount: 1,
  acknowledged: true,
  upsertedId: facilityId,
  matchedCount: 1,
  upsertedCount: 1,
};

describe('TfmFacilitiesRepo', () => {
  describe('updatePortalFacilityAmendmentByAmendmentId', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(mockGetCollection);
      mockGetCollection.mockResolvedValue({
        updateOne: mockUpdateOne,
      });

      mockUpdateOne.mockResolvedValue(mockUpdateResult);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it(`should call getCollection with ${MONGO_DB_COLLECTIONS.TFM_FACILITIES}`, async () => {
      // Act
      await TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId({ amendmentId, facilityId, update, auditDetails });

      // Assert
      expect(mockGetCollection).toHaveBeenCalledTimes(1);
      expect(mockGetCollection).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    });

    it(`should call updateOne with the correct parameters`, async () => {
      // Act
      await TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId({ amendmentId, facilityId, update, auditDetails });

      // Assert

      const expectedFindFilter = {
        _id: { $eq: new ObjectId(facilityId) },
        amendments: { $elemMatch: { amendmentId: { $eq: new ObjectId(amendmentId) }, type: AMENDMENT_TYPES.PORTAL } },
      };

      const expectedUpdateFilter = flatten({
        'amendments.$': update,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      });

      expect(mockUpdateOne).toHaveBeenCalledTimes(1);
      expect(mockUpdateOne).toHaveBeenCalledWith(expectedFindFilter, expectedUpdateFilter);
    });

    it(`should return the updateResult`, async () => {
      // Act
      const response = await TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId({ amendmentId, facilityId, update, auditDetails });

      // Assert
      expect(response).toEqual(mockUpdateResult);
    });

    it('should throw an AmendmentNotFoundError if no documents are matched', async () => {
      // Arrange
      mockUpdateOne.mockResolvedValue({ ...mockUpdateResult, modifiedCount: 0 });

      // Act + Assert
      await expect(() => TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId({ amendmentId, facilityId, update, auditDetails })).rejects.toThrow(
        AmendmentNotFoundError,
      );
    });
  });
});

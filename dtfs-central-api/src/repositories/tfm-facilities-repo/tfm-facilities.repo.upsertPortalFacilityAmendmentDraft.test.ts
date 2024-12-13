import { ObjectId, UpdateResult } from 'mongodb';
import { AMENDMENT_TYPES, MONGO_DB_COLLECTIONS, AMENDMENT_STATUS, FacilityNotFoundError } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { TfmFacilitiesRepo } from './tfm-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';
import { aPortalUser } from '../../../test-helpers';

const mockGetCollection = jest.fn();
const mockUpdateOne = jest.fn() as jest.Mock<Promise<UpdateResult>>;

const facilityId = new ObjectId();
const dealId = new ObjectId();

const amendment = {
  ...aPortalFacilityAmendment(),
  dealId,
  facilityId,
  amendmentId: new ObjectId(),
};

const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

const mockUpdateResult = {
  modifiedCount: 1,
  acknowledged: true,
  upsertedId: facilityId,
  matchedCount: 1,
  upsertedCount: 1,
};

describe('TfmFacilitiesRepo', () => {
  describe('upsertPortalFacilityAmendmentDraft', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(mockGetCollection);
      mockGetCollection.mockResolvedValue({
        updateOne: mockUpdateOne,
      });

      mockUpdateOne.mockResolvedValue(mockUpdateResult);
    });

    it(`should call getCollection with ${MONGO_DB_COLLECTIONS.TFM_FACILITIES}`, async () => {
      // Act
      await TfmFacilitiesRepo.upsertPortalFacilityAmendmentDraft(amendment, auditDetails);

      // Assert
      expect(mockGetCollection).toHaveBeenCalledTimes(1);
      expect(mockGetCollection).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    });

    it(`should call updateOne with the correct parameters`, async () => {
      // Act
      await TfmFacilitiesRepo.upsertPortalFacilityAmendmentDraft(amendment, auditDetails);

      // Assert

      const expectedFindFilter = { _id: { $eq: new ObjectId(facilityId) }, 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } };

      const expectedFirstUpdateFilter = {
        $pull: { amendments: { type: AMENDMENT_TYPES.PORTAL, status: { $ne: AMENDMENT_STATUS.COMPLETED } } },
        $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
      };

      const expectedSecondUpdateFilter = {
        $push: { amendments: amendment },
        $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
      };

      expect(mockUpdateOne).toHaveBeenCalledTimes(2);
      expect(mockUpdateOne).toHaveBeenCalledWith(expectedFindFilter, expectedFirstUpdateFilter);
      expect(mockUpdateOne).toHaveBeenCalledWith(expectedFindFilter, expectedSecondUpdateFilter);
    });

    it(`should return the updateResult`, async () => {
      // Act
      const response = await TfmFacilitiesRepo.upsertPortalFacilityAmendmentDraft(amendment, auditDetails);

      // Assert
      expect(response).toEqual(mockUpdateResult);
    });

    it('should throw a FacilityNotFoundError if no documents are matched', async () => {
      // Arrange
      mockUpdateOne.mockResolvedValue({ ...mockUpdateResult, modifiedCount: 0 });

      // Act + Assert
      await expect(() => TfmFacilitiesRepo.upsertPortalFacilityAmendmentDraft(amendment, auditDetails)).rejects.toThrow(FacilityNotFoundError);
    });
  });
});

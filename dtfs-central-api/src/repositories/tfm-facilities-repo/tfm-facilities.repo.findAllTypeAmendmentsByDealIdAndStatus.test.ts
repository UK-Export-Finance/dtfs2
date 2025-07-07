import { ObjectId } from 'mongodb';
import { CURRENCY, MONGO_DB_COLLECTIONS, PORTAL_AMENDMENT_STATUS, TfmFacility, TFM_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { TfmFacilitiesRepo } from './tfm-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';
import { aTfmFacility, aTfmFacilityAmendment, aCompletedTfmFacilityAmendment } from '../../../test-helpers';

const dealId = new ObjectId();

const getCollectionMock = jest.fn();
const findMock = jest.fn();
const findToArrayMock = jest.fn();

const { DRAFT, ACKNOWLEDGED, READY_FOR_CHECKERS_APPROVAL } = PORTAL_AMENDMENT_STATUS;
const { IN_PROGRESS, COMPLETED } = TFM_AMENDMENT_STATUS;

const aDraftPortalAmendment = {
  ...aPortalFacilityAmendment({ status: DRAFT }),
  currency: CURRENCY.GBP,
};
const anAcknowledgedPortalAmendment = {
  ...aPortalFacilityAmendment({ status: ACKNOWLEDGED, referenceNumber: '12345678-001' }),
  facilityType: 'Cash',
  ukefFacilityId: '12345678',
  currency: CURRENCY.GBP,
};
const aReadyForCheckersApprovalPortalAmendment = {
  ...aPortalFacilityAmendment({ status: READY_FOR_CHECKERS_APPROVAL }),
  currency: CURRENCY.GBP,
};

const aTfmAmendment = { ...aTfmFacilityAmendment(), currency: CURRENCY.GBP };
const aCompletedTfmAmendment = {
  ...aCompletedTfmFacilityAmendment(),
  facilityType: 'Cash',
  ukefFacilityId: '12345678',
  currency: CURRENCY.GBP,
  referenceNumber: '12345678-002',
};

const facilityWithPortalAmendments: TfmFacility = aTfmFacility({ amendments: [aDraftPortalAmendment, anAcknowledgedPortalAmendment], dealId });
const facilityWithMixedAmendments: TfmFacility = aTfmFacility({
  amendments: [aReadyForCheckersApprovalPortalAmendment, aTfmAmendment, aCompletedTfmAmendment],
  dealId,
});

describe('TfmFacilitiesRepo', () => {
  describe('findAllTypeAmendmentsByDealIdAndStatus', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      findToArrayMock.mockResolvedValue([]);
      findMock.mockReturnValue({ toArray: findToArrayMock });

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
      getCollectionMock.mockResolvedValue({
        find: findMock,
      });
    });

    it(`should call getCollection with ${MONGO_DB_COLLECTIONS.TFM_FACILITIES}`, async () => {
      // Act
      await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({ dealId });

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    });

    it('should call find with the expected parameters', async () => {
      // Act
      await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({ dealId });

      // Assert
      const expectedFilter = {
        'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) },
        amendments: {
          $elemMatch: {
            amendmentId: { $exists: true, $ne: null },
            referenceNumber: { $exists: true, $ne: null },
          },
        },
      };

      const expectedProjection = {
        projection: {
          amendments: 1,
          'facilitySnapshot.type': 1,
          'facilitySnapshot.ukefFacilityId': 1,
          'facilitySnapshot.currency': 1,
        },
      };

      expect(findMock).toHaveBeenCalledTimes(1);
      expect(findMock).toHaveBeenCalledWith(expectedFilter, expectedProjection);
    });

    it('should return all type amendments with an existing referenceNumber and amendmentId when no status filter is passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({ dealId });

      // Assert
      expect(result).toEqual([aCompletedTfmAmendment, anAcknowledgedPortalAmendment]);
    });

    it('should return the amendments filtered by status with an existing referenceNumber and amendmentId when a single status is passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({ dealId, statuses: [COMPLETED] });

      // Assert
      expect(result).toEqual([aCompletedTfmAmendment]);
    });

    it('should return an empty array when when a single status is passed in and referenceNumber does not exist', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({ dealId, statuses: [DRAFT] });

      // Assert
      expect(result).toEqual([]);
    });

    it('should return the amendments filtered by status with an existing referenceNumber and amendmentId when a multiple statuses are passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({
        dealId,
        statuses: [ACKNOWLEDGED, READY_FOR_CHECKERS_APPROVAL, IN_PROGRESS],
      });

      // Assert
      expect(result).toEqual([anAcknowledgedPortalAmendment]);
    });

    it('should return an empty array if no returned amendments match the given status type', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({
        dealId,
        statuses: [READY_FOR_CHECKERS_APPROVAL],
      });

      // Assert
      expect(result).toEqual([]);
    });
  });
});

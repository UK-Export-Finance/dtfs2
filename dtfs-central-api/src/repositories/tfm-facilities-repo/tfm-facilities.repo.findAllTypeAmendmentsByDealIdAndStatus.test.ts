import { ObjectId } from 'mongodb';
import { CURRENCY, MONGO_DB_COLLECTIONS, PORTAL_AMENDMENT_STATUS, TFM_AMENDMENT_STATUS, TfmFacility } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { TfmFacilitiesRepo } from './tfm-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';
import { aTfmFacility, aTfmFacilityAmendment } from '../../../test-helpers';

const dealId = new ObjectId();

const getCollectionMock = jest.fn();
const findMock = jest.fn();
const findToArrayMock = jest.fn();

const { DRAFT, ACKNOWLEDGED, READY_FOR_CHECKERS_APPROVAL } = PORTAL_AMENDMENT_STATUS;
const { IN_PROGRESS } = TFM_AMENDMENT_STATUS;

const aDraftPortalAmendment = {
  ...aPortalFacilityAmendment({ status: DRAFT }),
  facilityType: 'test cash facility',
  ukefFacilityId: '0041569417',
  currency: CURRENCY.GBP,
};
const anAcknowledgedPortalAmendment = {
  ...aPortalFacilityAmendment({ status: ACKNOWLEDGED }),
  facilityType: 'test cash facility',
  ukefFacilityId: '0041569417',
  currency: CURRENCY.GBP,
};
const aReadyForCheckersApprovalPortalAmendment = {
  ...aPortalFacilityAmendment({ status: READY_FOR_CHECKERS_APPROVAL }),
  facilityType: 'test cash facility',
  ukefFacilityId: '0041569417',
  currency: CURRENCY.GBP,
};

const aTfmAmendment = { ...aTfmFacilityAmendment(), facilityType: 'test cash facility', ukefFacilityId: '0041569417', currency: CURRENCY.GBP };

const facilityWithPortalAmendments: TfmFacility = aTfmFacility({ amendments: [aDraftPortalAmendment, anAcknowledgedPortalAmendment], dealId });
const facilityWithMixedAmendments: TfmFacility = aTfmFacility({ amendments: [aReadyForCheckersApprovalPortalAmendment, aTfmAmendment], dealId });

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
          'facilitySnapshot.name': 1,
          'facilitySnapshot.ukefFacilityId': 1,
          'facilitySnapshot.currency': 1,
        },
      };

      expect(findMock).toHaveBeenCalledTimes(1);
      expect(findMock).toHaveBeenCalledWith(expectedFilter, expectedProjection);
    });

    it('should return the all type amendments when no status filter is passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({ dealId });

      // Assert
      expect(result).toEqual([aDraftPortalAmendment, anAcknowledgedPortalAmendment, aReadyForCheckersApprovalPortalAmendment, aTfmAmendment]);
    });

    it('should return the amendments filtered by status when a single status is passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({ dealId, statuses: [DRAFT] });

      // Assert
      expect(result).toEqual([aDraftPortalAmendment]);
    });

    it('should return the amendments filtered by status when a multiple statuses are passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({
        dealId,
        statuses: [DRAFT, READY_FOR_CHECKERS_APPROVAL, IN_PROGRESS],
      });

      // Assert
      expect(result).toEqual([aDraftPortalAmendment, aReadyForCheckersApprovalPortalAmendment, aTfmAmendment]);
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

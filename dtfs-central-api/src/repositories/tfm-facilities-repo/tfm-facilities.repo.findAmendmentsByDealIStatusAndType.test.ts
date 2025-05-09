import { ObjectId } from 'mongodb';
import { AMENDMENT_TYPES, MONGO_DB_COLLECTIONS, PORTAL_AMENDMENT_STATUS, TfmFacility } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { TfmFacilitiesRepo } from './tfm-facilities.repo';
import { mongoDbClient } from '../../drivers/db-client';
import { aTfmFacility, aTfmFacilityAmendment } from '../../../test-helpers';

const dealId = new ObjectId();

const getCollectionMock = jest.fn();
const findMock = jest.fn();
const findToArrayMock = jest.fn();

const { DRAFT, ACKNOWLEDGED, READY_FOR_CHECKERS_APPROVAL } = PORTAL_AMENDMENT_STATUS;

const aDraftPortalAmendment = aPortalFacilityAmendment({ status: DRAFT });
const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: ACKNOWLEDGED });
const aReadyForCheckersApprovalPortalAmendment = aPortalFacilityAmendment({ status: READY_FOR_CHECKERS_APPROVAL });

const aTfmAmendment = aTfmFacilityAmendment();

const facilityWithAmendments: TfmFacility = aTfmFacility({ amendments: [aDraftPortalAmendment, anAcknowledgedPortalAmendment], dealId });
const facilityWithMixedAmendments: TfmFacility = aTfmFacility({ amendments: [aReadyForCheckersApprovalPortalAmendment, aTfmAmendment], dealId });
const types = [AMENDMENT_TYPES.PORTAL, AMENDMENT_TYPES.TFM];

describe('TfmFacilitiesRepo', () => {
  describe('findAmendmentsByDealIStatusAndType', () => {
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
      await TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType({ dealId, types });

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    });

    it('should call find with the expected parameters', async () => {
      // Act
      await TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType({ dealId, types });

      // Assert
      const expectedFilter = {
        'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) },
        'amendments.type': {
          $eq: AMENDMENT_TYPES.PORTAL,
        },
      };

      const expectedProjection = { projection: { amendments: 1 } };

      expect(findMock).toHaveBeenCalledTimes(1);
      expect(findMock).toHaveBeenCalledWith(expectedFilter, expectedProjection);
    });

    it('should return the all type amendments when no status filter is passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType({ dealId, types });

      // Assert
      expect(result).toEqual([aDraftPortalAmendment, anAcknowledgedPortalAmendment, aReadyForCheckersApprovalPortalAmendment]);
    });

    it('should return the amendments filtered by status and type when a single status is passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType({ dealId, statuses: [DRAFT], types });

      // Assert
      expect(result).toEqual([aDraftPortalAmendment]);
    });

    it('should return the amendments filtered by status when a multiple statuses are passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType({
        dealId,
        statuses: [DRAFT, READY_FOR_CHECKERS_APPROVAL],
        types,
      });

      // Assert
      expect(result).toEqual([aDraftPortalAmendment, aReadyForCheckersApprovalPortalAmendment]);
    });

    it('should return an empty array if no returned amendments match the given status type', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType({
        dealId,
        statuses: [READY_FOR_CHECKERS_APPROVAL],
        types,
      });

      // Assert
      expect(result).toEqual([]);
    });
  });
});

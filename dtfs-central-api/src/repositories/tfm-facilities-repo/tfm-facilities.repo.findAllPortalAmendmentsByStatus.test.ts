import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, PORTAL_AMENDMENT_STATUS, TfmFacility } from '@ukef/dtfs2-common';
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

const facilityWithPortalAmendments: TfmFacility = aTfmFacility({ amendments: [aDraftPortalAmendment, anAcknowledgedPortalAmendment], dealId });
const facilityWithMixedAmendments: TfmFacility = aTfmFacility({ amendments: [aReadyForCheckersApprovalPortalAmendment, aTfmAmendment], dealId });

describe('TfmFacilitiesRepo', () => {
  describe('findAllPortalAmendmentsByStatus', () => {
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
      await TfmFacilitiesRepo.findAllPortalAmendmentsByStatus({});

      // Assert
      expect(getCollectionMock).toHaveBeenCalledTimes(1);
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    });

    it('should return the all portal amendments when no status filter is passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllPortalAmendmentsByStatus({});

      // Assert
      expect(result).toEqual([aDraftPortalAmendment, anAcknowledgedPortalAmendment, aReadyForCheckersApprovalPortalAmendment]);
    });

    it('should return the portal amendments filtered by status when a single status is passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllPortalAmendmentsByStatus({ statuses: [DRAFT] });

      // Assert
      expect(result).toEqual([aDraftPortalAmendment]);
    });

    it('should return the portal amendments filtered by status when a multiple statuses are passed in', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments, facilityWithMixedAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllPortalAmendmentsByStatus({
        statuses: [DRAFT, READY_FOR_CHECKERS_APPROVAL],
      });

      // Assert
      expect(result).toEqual([aDraftPortalAmendment, aReadyForCheckersApprovalPortalAmendment]);
    });

    it('should return an empty array if no returned amendments match the given status type', async () => {
      // Arrange
      findToArrayMock.mockResolvedValueOnce([facilityWithPortalAmendments]);

      // Act
      const result = await TfmFacilitiesRepo.findAllPortalAmendmentsByStatus({
        statuses: [READY_FOR_CHECKERS_APPROVAL],
      });

      // Assert
      expect(result).toEqual([]);
    });
  });
});

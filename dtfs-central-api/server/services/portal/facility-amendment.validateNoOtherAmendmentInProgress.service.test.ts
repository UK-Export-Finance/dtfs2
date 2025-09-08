import { PORTAL_AMENDMENT_INPROGRESS_STATUSES, PORTAL_AMENDMENT_STATUS, PortalFacilityAmendmentConflictError } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockFindPortalAmendmentsByFacilityIdAndStatus = jest.fn();

console.error = jest.fn();

const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();

const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL });
const aChangesRequiredPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED });

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findPortalAmendmentsByFacilityIdAndStatus').mockImplementation(mockFindPortalAmendmentsByFacilityIdAndStatus);
    mockFindPortalAmendmentsByFacilityIdAndStatus.mockResolvedValue([]);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('validateNoOtherAmendmentInProgressOnFacility', () => {
    it('should call findPortalAmendmentsByDealIdAndStatus with the dealId and correct filters', async () => {
      // Act
      await PortalFacilityAmendmentService.validateNoOtherAmendmentInProgressOnFacility({
        facilityId,
        amendmentId,
      });

      // Assert
      expect(mockFindPortalAmendmentsByFacilityIdAndStatus).toHaveBeenCalledTimes(1);
      expect(mockFindPortalAmendmentsByFacilityIdAndStatus).toHaveBeenCalledWith({
        facilityId,
        statuses: PORTAL_AMENDMENT_INPROGRESS_STATUSES,
      });
    });

    it(`should throw an error if there is an existing portal amendment on the deal with the status ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, async () => {
      // Arrange
      mockFindPortalAmendmentsByFacilityIdAndStatus.mockResolvedValueOnce([aReadyForApprovalPortalAmendment]);

      // Act + Assert
      await expect(() =>
        PortalFacilityAmendmentService.validateNoOtherAmendmentInProgressOnFacility({
          facilityId,
          amendmentId,
        }),
      ).rejects.toThrow(PortalFacilityAmendmentConflictError);

      expect(console.error).toHaveBeenCalledWith('There is a portal facility amendment already in progress on this facility %s', facilityId);
    });

    it(`should throw an error if there is an existing portal amendment on the deal with the status ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED}`, async () => {
      // Arrange
      mockFindPortalAmendmentsByFacilityIdAndStatus.mockResolvedValueOnce([aChangesRequiredPortalAmendment]);

      // Act
      // Assert
      await expect(() =>
        PortalFacilityAmendmentService.validateNoOtherAmendmentInProgressOnFacility({
          facilityId,
          amendmentId,
        }),
      ).rejects.toThrow(PortalFacilityAmendmentConflictError);

      expect(console.error).toHaveBeenCalledWith('There is a portal facility amendment already in progress on this facility %s', facilityId);
    });

    it(`should not throw an error if the in progress amendment corresponds to the provided amendmentId`, async () => {
      // Arrange
      const providedAmendmentId = aReadyForApprovalPortalAmendment.amendmentId.toString();
      mockFindPortalAmendmentsByFacilityIdAndStatus.mockResolvedValueOnce([aReadyForApprovalPortalAmendment]);

      // Act
      await PortalFacilityAmendmentService.validateNoOtherAmendmentInProgressOnFacility({
        facilityId,
        amendmentId: providedAmendmentId,
      });

      // Assert
      expect(console.error).toHaveBeenCalledTimes(0);
    });

    it(`should not throw an error if no under way amendments are returned`, async () => {
      // Arrange
      mockFindPortalAmendmentsByFacilityIdAndStatus.mockResolvedValueOnce([]);

      // Act
      await PortalFacilityAmendmentService.validateNoOtherAmendmentInProgressOnFacility({
        facilityId,
        amendmentId,
      });

      // Assert
      expect(console.error).toHaveBeenCalledTimes(0);
    });
  });
});

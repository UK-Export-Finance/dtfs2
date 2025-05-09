import { PORTAL_AMENDMENT_INPROGRESS_STATUSES, PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, PortalFacilityAmendmentConflictError } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockFindPortalAmendmentsByDealIdAndStatus = jest.fn();

console.error = jest.fn();

const dealId = new ObjectId().toString();

const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL });
const aChangesRequiredPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED });

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findAmendmentsByDealIStatusAndType').mockImplementation(mockFindPortalAmendmentsByDealIdAndStatus);
    mockFindPortalAmendmentsByDealIdAndStatus.mockResolvedValue([]);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('validateNoOtherAmendmentInProgressOnDeal', () => {
    it('should call findAmendmentsByDealIStatusAndType with the dealId and correct filters', async () => {
      // Act
      await PortalFacilityAmendmentService.validateNoOtherAmendmentInProgressOnDeal({
        dealId,
      });

      // Assert
      expect(mockFindPortalAmendmentsByDealIdAndStatus).toHaveBeenCalledTimes(1);
      expect(mockFindPortalAmendmentsByDealIdAndStatus).toHaveBeenCalledWith({
        dealId,
        statuses: PORTAL_AMENDMENT_INPROGRESS_STATUSES,
        types: [AMENDMENT_TYPES.PORTAL],
      });
    });

    it(`should throw an error if there is an existing portal amendment on the deal with the status ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, async () => {
      // Arrange
      mockFindPortalAmendmentsByDealIdAndStatus.mockResolvedValueOnce([aReadyForApprovalPortalAmendment]);

      // Act + Assert
      await expect(() =>
        PortalFacilityAmendmentService.validateNoOtherAmendmentInProgressOnDeal({
          dealId,
        }),
      ).rejects.toThrow(PortalFacilityAmendmentConflictError);
      expect(console.error).toHaveBeenCalledWith('There is a portal facility amendment already in progress on this deal');
    });

    it(`should throw an error if there is an existing portal amendment on the deal with the status ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED}`, async () => {
      // Arrange
      mockFindPortalAmendmentsByDealIdAndStatus.mockResolvedValueOnce([aChangesRequiredPortalAmendment]);

      // Act
      // Assert
      await expect(() =>
        PortalFacilityAmendmentService.validateNoOtherAmendmentInProgressOnDeal({
          dealId,
        }),
      ).rejects.toThrow(PortalFacilityAmendmentConflictError);

      expect(console.error).toHaveBeenCalledWith('There is a portal facility amendment already in progress on this deal');
    });

    it(`should not throw an error if the in progress amendment corresponds to the provided amendmentId`, async () => {
      // Arrange
      const amendmentId = aReadyForApprovalPortalAmendment.amendmentId.toString();
      mockFindPortalAmendmentsByDealIdAndStatus.mockResolvedValueOnce([aReadyForApprovalPortalAmendment]);

      // Act
      await PortalFacilityAmendmentService.validateNoOtherAmendmentInProgressOnDeal({
        dealId,
        amendmentId,
      });

      // Assert
      expect(console.error).toHaveBeenCalledTimes(0);
    });

    it(`should not throw an error if no under way amendments are returned`, async () => {
      // Arrange
      mockFindPortalAmendmentsByDealIdAndStatus.mockResolvedValueOnce([]);

      // Act
      await PortalFacilityAmendmentService.validateNoOtherAmendmentInProgressOnDeal({
        dealId,
      });

      // Assert
      expect(console.error).toHaveBeenCalledTimes(0);
    });
  });
});

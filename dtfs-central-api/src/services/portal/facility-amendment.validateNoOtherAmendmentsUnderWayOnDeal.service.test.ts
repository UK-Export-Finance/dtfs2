import { PORTAL_AMENDMENT_UNDER_WAY_STATUSES, PORTAL_AMENDMENT_STATUS, PortalFacilityAmendmentConflictError } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockFindPortalAmendmentsByDealIdAndStatus = jest.fn();

console.error = jest.fn();

const dealId = new ObjectId().toString();

const aDraftPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.DRAFT });
const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL });
const aChangesRequiredPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED });

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findPortalAmendmentsByDealIdAndStatus').mockImplementation(mockFindPortalAmendmentsByDealIdAndStatus);
    mockFindPortalAmendmentsByDealIdAndStatus.mockResolvedValue([]);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('validateNoOtherAmendmentsUnderWayOnDeal', () => {
    it('should call findPortalAmendmentsForDeal with the dealId and correct filters', async () => {
      // Act
      await PortalFacilityAmendmentService.validateNoOtherAmendmentsUnderWayOnDeal({
        dealId,
      });

      // Assert
      expect(mockFindPortalAmendmentsByDealIdAndStatus).toHaveBeenCalledTimes(1);
      expect(mockFindPortalAmendmentsByDealIdAndStatus).toHaveBeenCalledWith({
        dealId,
        statuses: PORTAL_AMENDMENT_UNDER_WAY_STATUSES,
      });
    });

    it(`should throw an error if there is an existing portal amendment on the deal with the status ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, async () => {
      // Arrange
      mockFindPortalAmendmentsByDealIdAndStatus.mockResolvedValueOnce([aDraftPortalAmendment, aReadyForApprovalPortalAmendment]);

      // Act + Assert
      await expect(() =>
        PortalFacilityAmendmentService.validateNoOtherAmendmentsUnderWayOnDeal({
          dealId,
        }),
      ).rejects.toThrow(PortalFacilityAmendmentConflictError);
      expect(console.error).toHaveBeenCalledWith('There is a portal facility amendment already under way on this deal');
    });

    it(`should throw an error if there is an existing portal amendment on the deal with the status ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED}`, async () => {
      // Arrange
      mockFindPortalAmendmentsByDealIdAndStatus.mockResolvedValueOnce([aDraftPortalAmendment, aChangesRequiredPortalAmendment]);

      // Act
      // Assert
      await expect(() =>
        PortalFacilityAmendmentService.validateNoOtherAmendmentsUnderWayOnDeal({
          dealId,
        }),
      ).rejects.toThrow(PortalFacilityAmendmentConflictError);

      expect(console.error).toHaveBeenCalledWith('There is a portal facility amendment already under way on this deal');
    });

    it(`should not throw an error if no under way amendments are returned`, async () => {
      // Arrange
      mockFindPortalAmendmentsByDealIdAndStatus.mockResolvedValueOnce([]);

      // Act
      await PortalFacilityAmendmentService.validateNoOtherAmendmentsUnderWayOnDeal({
        dealId,
      });

      // Assert
      expect(console.error).toHaveBeenCalledTimes(0);
    });
  });
});

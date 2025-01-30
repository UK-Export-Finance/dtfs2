import { PORTAL_AMENDMENT_STATUS, PortalFacilityAmendmentConflictError } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from './facility-amendment.service';

const mockFindPortalAmendmentsForDeal = jest.fn();

console.error = jest.fn();

const dealId = new ObjectId().toString();

const aDraftPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.DRAFT });
const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_APPROVAL });
const aChangesRequiredPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.CHANGES_REQUIRED });
const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(PortalFacilityAmendmentService, 'findPortalAmendmentsForDeal').mockImplementation(mockFindPortalAmendmentsForDeal);
    mockFindPortalAmendmentsForDeal.mockResolvedValue([]);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('validateNoOtherAmendmentsUnderWayOnDeal', () => {
    it('should call findPortalAmendmentsForDeal with the dealId', async () => {
      // Act
      await PortalFacilityAmendmentService.validateNoOtherAmendmentsUnderWayOnDeal({
        dealId,
      });

      // Assert
      expect(mockFindPortalAmendmentsForDeal).toHaveBeenCalledTimes(1);
      expect(mockFindPortalAmendmentsForDeal).toHaveBeenCalledWith({ dealId });
    });

    it(`should throw an error if there is an existing portal amendment on the deal with the status ${PORTAL_AMENDMENT_STATUS.READY_FOR_APPROVAL}`, async () => {
      // Arrange
      mockFindPortalAmendmentsForDeal.mockResolvedValueOnce([aDraftPortalAmendment, aReadyForApprovalPortalAmendment]);

      // Act + Assert
      await expect(() =>
        PortalFacilityAmendmentService.validateNoOtherAmendmentsUnderWayOnDeal({
          dealId,
        }),
      ).rejects.toThrow(PortalFacilityAmendmentConflictError);
      expect(console.error).toHaveBeenCalledWith('There is a portal facility amendment already under way on this deal');
    });

    it(`should throw an error if there is an existing portal amendment on the deal with the status ${PORTAL_AMENDMENT_STATUS.CHANGES_REQUIRED}`, async () => {
      // Arrange
      mockFindPortalAmendmentsForDeal.mockResolvedValueOnce([aDraftPortalAmendment, aChangesRequiredPortalAmendment]);

      // Act
      // Assert
      await expect(() =>
        PortalFacilityAmendmentService.validateNoOtherAmendmentsUnderWayOnDeal({
          dealId,
        }),
      ).rejects.toThrow(PortalFacilityAmendmentConflictError);

      expect(console.error).toHaveBeenCalledWith('There is a portal facility amendment already under way on this deal');
    });

    it(`should not throw an error if there is an existing portal amendment on the deal with the status ${PORTAL_AMENDMENT_STATUS.DRAFT} or ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED}`, async () => {
      // Arrange
      mockFindPortalAmendmentsForDeal.mockResolvedValueOnce([aDraftPortalAmendment, anAcknowledgedPortalAmendment]);

      // Act
      await PortalFacilityAmendmentService.validateNoOtherAmendmentsUnderWayOnDeal({
        dealId,
      });

      // Assert
      expect(console.error).toHaveBeenCalledTimes(0);
    });
  });
});

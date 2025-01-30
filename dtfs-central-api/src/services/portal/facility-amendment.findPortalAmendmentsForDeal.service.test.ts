/* eslint-disable import/first */
import { ObjectId } from 'mongodb';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PORTAL_AMENDMENT_STATUS, TfmFacility } from '@ukef/dtfs2-common';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { aCompletedTfmFacilityAmendment, aTfmFacility, aTfmFacilityAmendment } from '../../../test-helpers';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockFindByDealId = jest.fn();

const dealId = new ObjectId().toString();

const aDraftPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.DRAFT });
const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });
const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_APPROVAL });

const aTfmAmendment = aTfmFacilityAmendment();
const aCompletedTfmAmendment = aCompletedTfmFacilityAmendment();

const facilityWithNoAmendments: TfmFacility = aTfmFacility({ amendments: [], dealId });
const facilityWithATfmAmendment: TfmFacility = aTfmFacility({ amendments: [aTfmAmendment], dealId });
const facilityWithPortalAmendments: TfmFacility = aTfmFacility({ amendments: [aDraftPortalAmendment, anAcknowledgedPortalAmendment], dealId });
const facilityWithMixedAmendments: TfmFacility = aTfmFacility({ amendments: [aReadyForApprovalPortalAmendment, aCompletedTfmAmendment], dealId });

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findByDealId').mockImplementation(mockFindByDealId);

    mockFindByDealId.mockResolvedValue([]);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('findPortalAmendmentsForDeal', () => {
    it('should call TfmFacilitiesRepo.findByDealId with the correct params', async () => {
      // Act
      await PortalFacilityAmendmentService.findPortalAmendmentsForDeal({
        dealId,
      });

      // Assert
      expect(mockFindByDealId).toHaveBeenCalledTimes(1);
      expect(mockFindByDealId).toHaveBeenCalledWith(dealId);
    });
  });

  it('should return the portal amendments on the facilities returned by TfmFacilitiesRepo.findPortalAmendmentsForDeal', async () => {
    // Arrange
    mockFindByDealId.mockResolvedValueOnce([facilityWithNoAmendments, facilityWithATfmAmendment, facilityWithPortalAmendments, facilityWithMixedAmendments]);

    // Act
    const expected = await PortalFacilityAmendmentService.findPortalAmendmentsForDeal({
      dealId,
    });

    // Assert
    expect(expected).toEqual([aDraftPortalAmendment, anAcknowledgedPortalAmendment, aReadyForApprovalPortalAmendment]);
  });

  it('should return an empty array if no facilities are found for the given deal id when calling TfmFacilitiesRepo.findByDealId', async () => {
    // Arrange
    mockFindByDealId.mockResolvedValueOnce([]);

    // Act
    const returned = await PortalFacilityAmendmentService.findPortalAmendmentsForDeal({
      dealId,
    });

    // Assert
    expect(returned).toEqual([]);
  });

  it('should return an empty array if no amendments are found on the facilities for the given deal id when calling TfmFacilitiesRepo.findByDealId', async () => {
    // Arrange
    mockFindByDealId.mockResolvedValueOnce([facilityWithNoAmendments]);

    // Act
    const returned = await PortalFacilityAmendmentService.findPortalAmendmentsForDeal({
      dealId,
    });

    // Assert
    expect(returned).toEqual([]);
  });

  it('should return an empty array if no portal amendments are found on the facilities for the given deal id when calling TfmFacilitiesRepo.findByDealId', async () => {
    // Arrange
    mockFindByDealId.mockResolvedValueOnce([facilityWithATfmAmendment, facilityWithNoAmendments]);

    // Act
    const returned = await PortalFacilityAmendmentService.findPortalAmendmentsForDeal({
      dealId,
    });

    // Assert
    expect(returned).toEqual([]);
  });
});

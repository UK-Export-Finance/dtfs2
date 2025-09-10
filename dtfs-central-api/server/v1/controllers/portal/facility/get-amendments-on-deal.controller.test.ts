import { TestApiError } from "@ukef/dtfs2-common/test-helpers";
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS, PortalAmendmentStatus } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { GetAmendmentsOnDealRequest, getAmendmentsOnDeal } from './get-amendments-on-deal.controller';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import { aTfmFacilityAmendment } from '../../../../../test-helpers';

const { DRAFT, ACKNOWLEDGED, READY_FOR_CHECKERS_APPROVAL, FURTHER_MAKERS_INPUT_REQUIRED } = PORTAL_AMENDMENT_STATUS;

const dealId = 'dealId';
const mockStatuses = [READY_FOR_CHECKERS_APPROVAL, FURTHER_MAKERS_INPUT_REQUIRED];

const aDraftPortalAmendment = aPortalFacilityAmendment({ status: DRAFT });
const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: READY_FOR_CHECKERS_APPROVAL });
const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: ACKNOWLEDGED });
const aTfmAmendment = aTfmFacilityAmendment();
const mockReturnedAmendments = [aDraftPortalAmendment, aReadyForApprovalPortalAmendment, anAcknowledgedPortalAmendment, aTfmAmendment];

const mockFindAllTypeAmendmentsByDealIdAndStatus = jest.fn();

const generateHttpMocks = ({ statuses }: { statuses?: PortalAmendmentStatus[] } = {}) =>
  createMocks<GetAmendmentsOnDealRequest>({ params: { dealId }, query: { statuses } });

describe('getAmendmentsOnDeal', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findAllTypeAmendmentsByDealIdAndStatus').mockImplementation(mockFindAllTypeAmendmentsByDealIdAndStatus);
    mockFindAllTypeAmendmentsByDealIdAndStatus.mockResolvedValue(mockReturnedAmendments);
  });

  it('should call TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus with the correct params when no statuses are passed in the body', async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getAmendmentsOnDeal(req, res);

    // Assert
    expect(mockFindAllTypeAmendmentsByDealIdAndStatus).toHaveBeenCalledTimes(1);
    expect(mockFindAllTypeAmendmentsByDealIdAndStatus).toHaveBeenCalledWith({
      dealId,
    });
  });

  it('should call TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus with the correct params when statuses are passed in the body', async () => {
    // Arrange
    const { req, res } = generateHttpMocks({ statuses: mockStatuses });

    // Act
    await getAmendmentsOnDeal(req, res);

    // Assert
    expect(mockFindAllTypeAmendmentsByDealIdAndStatus).toHaveBeenCalledTimes(1);
    expect(mockFindAllTypeAmendmentsByDealIdAndStatus).toHaveBeenCalledWith({
      dealId,
      statuses: mockStatuses,
    });
  });

  it(`should return ${HttpStatusCode.Ok} and the amendments on the deal`, async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getAmendmentsOnDeal(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getData()).toEqual(mockReturnedAmendments);
  });

  it('should return the correct status and body if TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus throws an api error', async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockFindAllTypeAmendmentsByDealIdAndStatus.mockRejectedValue(new TestApiError({ status, message }));

    const { req, res } = generateHttpMocks();

    // Act
    await getAmendmentsOnDeal(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(status);
    expect(res._getData()).toEqual({
      status,
      message,
    });
  });

  it(`should return ${HttpStatusCode.InternalServerError} if TfmFacilitiesRepo.findAlTypeAmendmentsByDealIdAndStatus throws an unknown error`, async () => {
    // Arrange
    const message = 'Test error message';
    mockFindAllTypeAmendmentsByDealIdAndStatus.mockRejectedValue(new Error(message));

    const { req, res } = generateHttpMocks();

    // Act
    await getAmendmentsOnDeal(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting all type facility amendments on deal',
    });
  });
});

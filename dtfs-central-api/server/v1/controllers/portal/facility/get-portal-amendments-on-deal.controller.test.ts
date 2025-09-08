import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS, PortalAmendmentStatus, TestApiError } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { GetPortalAmendmentsOnDealRequest, getPortalAmendmentsOnDeal } from './get-portal-amendments-on-deal.controller';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

const { DRAFT, ACKNOWLEDGED, READY_FOR_CHECKERS_APPROVAL, FURTHER_MAKERS_INPUT_REQUIRED } = PORTAL_AMENDMENT_STATUS;

const dealId = 'dealId';
const mockStatuses = [READY_FOR_CHECKERS_APPROVAL, FURTHER_MAKERS_INPUT_REQUIRED];

const aDraftPortalAmendment = aPortalFacilityAmendment({ status: DRAFT });
const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: READY_FOR_CHECKERS_APPROVAL });
const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: ACKNOWLEDGED });
const mockReturnedPortalAmendments = [aDraftPortalAmendment, aReadyForApprovalPortalAmendment, anAcknowledgedPortalAmendment];

const mockFindPortalAmendmentsByDealIdAndStatus = jest.fn();

const generateHttpMocks = ({ statuses }: { statuses?: PortalAmendmentStatus[] } = {}) =>
  createMocks<GetPortalAmendmentsOnDealRequest>({ params: { dealId }, query: { statuses } });

describe('getPortalAmendmentsByDealId', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findPortalAmendmentsByDealIdAndStatus').mockImplementation(mockFindPortalAmendmentsByDealIdAndStatus);
    mockFindPortalAmendmentsByDealIdAndStatus.mockResolvedValue(mockReturnedPortalAmendments);
  });

  it('should call TfmFacilitiesRepo.findPortalAmendmentsByDealIdAndStatus with the correct params when no statuses are passed in the body', async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getPortalAmendmentsOnDeal(req, res);

    // Assert
    expect(mockFindPortalAmendmentsByDealIdAndStatus).toHaveBeenCalledTimes(1);
    expect(mockFindPortalAmendmentsByDealIdAndStatus).toHaveBeenCalledWith({
      dealId,
    });
  });

  it('should call TfmFacilitiesRepo.findPortalAmendmentsByDealIdAndStatus with the correct params when statuses are passed in the body', async () => {
    // Arrange
    const { req, res } = generateHttpMocks({ statuses: mockStatuses });

    // Act
    await getPortalAmendmentsOnDeal(req, res);

    // Assert
    expect(mockFindPortalAmendmentsByDealIdAndStatus).toHaveBeenCalledTimes(1);
    expect(mockFindPortalAmendmentsByDealIdAndStatus).toHaveBeenCalledWith({
      dealId,
      statuses: mockStatuses,
    });
  });

  it(`should return ${HttpStatusCode.Ok} and the amendments on the deal`, async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getPortalAmendmentsOnDeal(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getData()).toEqual(mockReturnedPortalAmendments);
  });

  it(`should return a ${HttpStatusCode.Forbidden} status and the body if TfmFacilitiesRepo.findPortalAmendmentsByDealIdAndStatus throws an api error`, async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockFindPortalAmendmentsByDealIdAndStatus.mockRejectedValue(new TestApiError({ status, message }));

    const { req, res } = generateHttpMocks();

    // Act
    await getPortalAmendmentsOnDeal(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(status);
    expect(res._getData()).toEqual({
      status,
      message,
    });
  });

  it(`should return ${HttpStatusCode.InternalServerError} if TfmFacilitiesRepo.findPortalAmendmentsByDealIdAndStatus throws an unknown error`, async () => {
    // Arrange
    const message = 'Test error message';
    mockFindPortalAmendmentsByDealIdAndStatus.mockRejectedValue(new Error(message));

    const { req, res } = generateHttpMocks();

    // Act
    await getPortalAmendmentsOnDeal(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting portal facility amendments on deal',
    });
  });
});

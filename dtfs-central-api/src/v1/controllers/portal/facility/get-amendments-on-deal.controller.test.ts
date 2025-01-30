import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS, TestApiError } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { GetDealAmendmentsRequest, getPortalAmendmentsByDealId } from './get-amendments-on-deal.controller';

const dealId = 'dealId';

const aDraftPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.DRAFT });
const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_APPROVAL });
const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });
const mockReturnedPortalAmendments = [aDraftPortalAmendment, aReadyForApprovalPortalAmendment, anAcknowledgedPortalAmendment];

const mockFindPortalAmendmentsForDeal = jest.fn();

const generateHttpMocks = () => createMocks<GetDealAmendmentsRequest>({ params: { dealId } });

describe('getPortalAmendmentsByDealId', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(PortalFacilityAmendmentService, 'findPortalAmendmentsForDeal').mockImplementation(mockFindPortalAmendmentsForDeal);
    mockFindPortalAmendmentsForDeal.mockResolvedValue(mockReturnedPortalAmendments);
  });

  it('should call PortalFacilityAmendmentService.findPortalAmendmentsForDeal with the correct params', async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getPortalAmendmentsByDealId(req, res);

    // Assert

    expect(mockFindPortalAmendmentsForDeal).toHaveBeenCalledTimes(1);
    expect(mockFindPortalAmendmentsForDeal).toHaveBeenCalledWith({
      dealId,
    });
  });

  it(`should return ${HttpStatusCode.Ok} and the amendments on the deal`, async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getPortalAmendmentsByDealId(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getData()).toEqual(mockReturnedPortalAmendments);
  });

  it('should return the correct status and body if PortalFacilityAmendmentService.updatePortalFacilityAmendment throws an api error', async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockFindPortalAmendmentsForDeal.mockRejectedValue(new TestApiError({ status, message }));

    const { req, res } = generateHttpMocks();

    // Act
    await getPortalAmendmentsByDealId(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(status);
    expect(res._getData()).toEqual({
      status,
      message,
    });
  });

  it(`should return ${HttpStatusCode.InternalServerError} if PortalFacilityAmendmentService.updatePortalFacilityAmendment throws an unknown error`, async () => {
    // Arrange
    const message = 'Test error message';
    mockFindPortalAmendmentsForDeal.mockRejectedValue(new Error(message));

    const { req, res } = generateHttpMocks();

    // Act
    await getPortalAmendmentsByDealId(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting portal facility amendments on deal',
    });
  });
});

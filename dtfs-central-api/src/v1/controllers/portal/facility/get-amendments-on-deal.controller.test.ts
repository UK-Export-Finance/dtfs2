import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AMENDMENT_TYPES, AmendmentType, PORTAL_AMENDMENT_STATUS, PortalAmendmentStatus, TestApiError, TfmAmendmentStatus } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { GetAmendmentsOnDealRequest, getAmendmentsOnDeal } from './get-amendments-on-deal.controller';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

const { DRAFT, ACKNOWLEDGED, READY_FOR_CHECKERS_APPROVAL, FURTHER_MAKERS_INPUT_REQUIRED } = PORTAL_AMENDMENT_STATUS;

const dealId = 'dealId';
const mockStatuses = [READY_FOR_CHECKERS_APPROVAL, FURTHER_MAKERS_INPUT_REQUIRED];
const mockTypes = [AMENDMENT_TYPES.PORTAL, AMENDMENT_TYPES.TFM];

const aDraftPortalAmendment = aPortalFacilityAmendment({ status: DRAFT });
const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: READY_FOR_CHECKERS_APPROVAL });
const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: ACKNOWLEDGED });
const mockReturnedPortalAmendments = [aDraftPortalAmendment, aReadyForApprovalPortalAmendment, anAcknowledgedPortalAmendment];

const mockFindAmendmentsByDealIStatusAndType = jest.fn();
console.error = jest.fn();

const generateHttpMocks = ({ statuses, types }: { statuses?: PortalAmendmentStatus[] | TfmAmendmentStatus[]; types?: AmendmentType[] } = {}) =>
  createMocks<GetAmendmentsOnDealRequest>({ params: { dealId }, query: { statuses, types } });

describe('getAmendmentsByDealId', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findAmendmentsByDealIStatusAndType').mockImplementation(mockFindAmendmentsByDealIStatusAndType);
    mockFindAmendmentsByDealIStatusAndType.mockResolvedValue(mockReturnedPortalAmendments);
  });

  it('should call TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType with the correct params when no statuses are passed in the body', async () => {
    // Arrange
    const { req, res } = generateHttpMocks({ types: mockTypes });

    // Act
    await getAmendmentsOnDeal(req, res);

    // Assert
    expect(mockFindAmendmentsByDealIStatusAndType).toHaveBeenCalledTimes(1);
    expect(mockFindAmendmentsByDealIStatusAndType).toHaveBeenCalledWith({
      dealId,
      types: mockTypes,
    });
  });

  it('should call TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType with the correct params when statuses are passed in the body', async () => {
    // Arrange
    const { req, res } = generateHttpMocks({ statuses: mockStatuses, types: mockTypes });

    // Act
    await getAmendmentsOnDeal(req, res);

    // Assert
    expect(mockFindAmendmentsByDealIStatusAndType).toHaveBeenCalledTimes(1);
    expect(mockFindAmendmentsByDealIStatusAndType).toHaveBeenCalledWith({
      dealId,
      statuses: mockStatuses,
      types: mockTypes,
    });
  });

  it(`should return ${HttpStatusCode.Ok} and the amendments on the deal`, async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getAmendmentsOnDeal(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getData()).toEqual(mockReturnedPortalAmendments);
  });

  it('should return the correct status and body if TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType throws an api error', async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockFindAmendmentsByDealIStatusAndType.mockRejectedValue(new TestApiError({ status, message }));

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

  it(`should return ${HttpStatusCode.InternalServerError} if TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType throws an unknown error`, async () => {
    // Arrange
    const message = 'Test error message';
    mockFindAmendmentsByDealIStatusAndType.mockRejectedValue(new Error(message));

    const { req, res } = generateHttpMocks();

    // Act
    await getAmendmentsOnDeal(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting facility amendments on deal',
    });
  });
});

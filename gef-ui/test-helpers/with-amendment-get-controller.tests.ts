import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { Mocks } from 'node-mocks-http';
import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { MOCK_UNISSUED_FACILITY } from '../server/utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from './mock-amendment';

const aMockError = () => new Error();

/**
 * Unit tests for maker journey GET controllers. Tests that not founds, api errors and invalid amendments are handled correctly
 * @param withAmendmentGetControllerTestsParams
 * @param withAmendmentGetControllerTestsParams.makeRequest - controller function to make request
 * @param withAmendmentGetControllerTestsParams.getHttpMocks - function to generate req & res objects
 * @param withAmendmentGetControllerTestsParams.getFacilityMock - api.getFacility mock
 * @param withAmendmentGetControllerTestsParams.getApplicationMock - api.getApplication mock
 * @param withAmendmentGetControllerTestsParams.getAmendmentMock - api.getAmendment mock
 * @param withAmendmentGetControllerTestsParams.dealId - the mock deal id
 * @param withAmendmentGetControllerTestsParams.facilityId - the mock facility id
 * @param withAmendmentGetControllerTestsParams.amendmentId - the mock amendment id
 */
export const withAmendmentGetControllerTests = <TRequest extends Request>({
  makeRequest,
  getHttpMocks,
  getFacilityMock,
  getApplicationMock,
  getAmendmentMock,
  dealId,
  facilityId,
  amendmentId,
}: {
  makeRequest: (req: TRequest, res: Response) => Promise<void>;
  getHttpMocks: () => Mocks<TRequest, Response<any, Record<string, any>>>;
  getFacilityMock: jest.Mock;
  getApplicationMock: jest.Mock;
  getAmendmentMock: jest.Mock;
  dealId: string;
  facilityId: string;
  amendmentId: string;
}) => {
  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await makeRequest(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await makeRequest(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should call getAmendment with the correct facilityId, amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await makeRequest(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await makeRequest(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await makeRequest(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect if the amendment is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(undefined);

    // Act
    await makeRequest(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s was not found on facility %s', amendmentId, facilityId);
  });

  it(`should redirect if the amendment has status ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(new PortalFacilityAmendmentWithUkefIdMockBuilder().withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL));

    // Act
    await makeRequest(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/gef/application-details/${dealId}`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s is not assigned to Maker', amendmentId);
  });

  it('should redirect if the facility cannot be amended', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue(MOCK_UNISSUED_FACILITY);

    // Act
    await makeRequest(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/gef/application-details/${dealId}`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('User cannot amend facility %s on deal %s', facilityId, dealId);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getApplicationMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await makeRequest(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await makeRequest(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('should render `problem with service` if getAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await makeRequest(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
  });
};

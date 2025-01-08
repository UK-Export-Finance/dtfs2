import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, DEAL_STATUS, PORTAL_LOGIN_STATUS, DEAL_SUBMISSION_TYPE, ROLES, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';

/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_UNISSUED_FACILITY, MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { postCancelPortalFacilityAmendment, PostCancelPortalFacilityAmendmentRequest } from './cancel-portal-facility-amendment';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';
const previousPage = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`;

const postHttpMocks = () =>
  createMocks<PostCancelPortalFacilityAmendmentRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
    query: {
      return: 'true',
    },
    body: {
      previousPage,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('postCancelPortalFacilityAmendment', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should redirect to previous page if return=`true`', async () => {
    // Arrange
    const { req, res } = postHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(previousPage);
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = postHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = postHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should call getAmendment with the correct facilityId, amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = postHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = postHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = postHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('should redirect if the facility cannot be amended', async () => {
    // Arrange
    const { req, res } = postHttpMocks();
    getFacilityMock.mockResolvedValue(MOCK_UNISSUED_FACILITY);

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/gef/application-details/${dealId}`);
  });

  it('should redirect if the amendment is not found', async () => {
    // Arrange
    const { req, res } = postHttpMocks();
    getAmendmentMock.mockResolvedValue(undefined);

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    // Arrange
    getApplicationMock.mockRejectedValue(new Error('test error'));
    const { req, res } = postHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    // Arrange
    getFacilityMock.mockRejectedValue(new Error('test error'));
    const { req, res } = postHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });

  it('should render `problem with service` if getAmendment throws an error', async () => {
    // Arrange
    getAmendmentMock.mockRejectedValue(new Error('test error'));
    const { req, res } = postHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});

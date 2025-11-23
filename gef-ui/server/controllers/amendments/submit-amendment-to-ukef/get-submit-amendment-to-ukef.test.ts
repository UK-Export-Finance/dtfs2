/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

import * as dtfsCommon from '@ukef/dtfs2-common';
import { PORTAL_LOGIN_STATUS, ROLES, DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications.js';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { getSubmitAmendmentToUkef, GetSubmitAmendmentToUkefRequest } from './get-submit-amendment-to-ukef.ts';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
}));

console.error = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const getHttpMocks = () =>
  createMocks<GetSubmitAmendmentToUkefRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.CHECKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED, submissionCount: 1 };

describe('getSubmitAmendmentToUkef', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder()
        .withDealId(dealId)
        .withFacilityId(facilityId)
        .withAmendmentId(amendmentId)
        .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
        .build(),
    );
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render the submitAmendmentToUkef confirmation template', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/submit-to-ukef.njk');
  });

  it('should redirect to "/not-found" if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await getSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect to "/not-found" if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await getSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect to "/not-found" if the amendment is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(undefined);

    // Act
    await getSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s not found for the facility %s', amendmentId, facilityId);
  });

  it(`should redirect to "/not-found" if the amendment is not ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const draftAmendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withStatus(PORTAL_AMENDMENT_STATUS.DRAFT)
      .build();

    getAmendmentMock.mockResolvedValue(draftAmendment);

    // Act
    await getSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith("Amendment %s on facility %s is not ready for checker's approval", amendmentId, facilityId);
  });

  it('should render problem with service if getApplication throws an error', async () => {
    // Arrange
    const mockError = new Error('test error');
    getApplicationMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await getSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error getting for submit amendment to ukef page %o', mockError);
  });

  it('should render problem with service if getFacility throws an error', async () => {
    // Arrange
    const mockError = new Error('test error');
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await getSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error getting for submit amendment to ukef page %o', mockError);
  });

  it('should render problem with service if updateAmendment throws an error', async () => {
    // Arrange
    const mockError = new Error('test error');
    getAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await getSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error getting for submit amendment to ukef page %o', mockError);
  });
});

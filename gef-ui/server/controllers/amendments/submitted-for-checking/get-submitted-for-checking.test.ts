/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  aPortalSessionUser,
  CURRENCY,
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  Facility,
  PORTAL_LOGIN_STATUS,
  ROLES,
  PortalFacilityAmendmentWithUkefId,
  FACILITY_TYPE,
  PORTAL_AMENDMENT_STATUS,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { getSubmittedForChecking, GetSubmittedForCheckingRequest } from './get-submitted-for-checking.ts';
import { Deal } from '../../../types/deal';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { SubmittedForCheckingViewModel } from '../../../types/view-models/amendments/submitted-for-checking-view-model.ts';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const returnLink = '/dashboard/deals';

const getHttpMocks = () =>
  createMocks<GetSubmittedForCheckingRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as Deal;

const mockFacility = {
  currency: {
    id: CURRENCY.GBP,
  },
  type: FACILITY_TYPE.CASH,
  hasBeenIssued: true,
} as Facility;

describe('getSubmittedForChecking', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue({ details: mockFacility });
    getAmendmentMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should call getAmendment with the correct facilityId, amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
  });

  it('should render the submitted for checking page template', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    const expectedRenderData: SubmittedForCheckingViewModel = {
      returnLink,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/submitted-for-checking.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('should redirect if the amendment is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(undefined);

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('should redirect if the facility cannot be amended', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: { ...mockFacility, hasBeenIssued: false } });

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/gef/application-details/${dealId}`);
  });

  it('should redirect to not found if the amendment is not ready for checkers approval', async () => {
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
    await getSubmittedForChecking(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    // Arrange
    getApplicationMock.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    // Arrange
    getFacilityMock.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });

  it('should render `problem with service` if getAmendment throws an error', async () => {
    // Arrange
    getAmendmentMock.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await getSubmittedForChecking(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});

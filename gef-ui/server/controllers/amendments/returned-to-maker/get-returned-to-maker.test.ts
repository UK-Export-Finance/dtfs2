import { aPortalSessionUser, PORTAL_LOGIN_STATUS, ROLES, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import api from '../../../services/api';
import { getReturnedToMaker, GetReturnedToMakerRequest } from './get-returned-to-maker';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';

console.error = jest.fn();

const mockError = new Error('test error');

const getAmendmentMock = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

jest.mock('../../../services/api');

const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
  .withDealId(dealId)
  .withFacilityId(facilityId)
  .withAmendmentId(amendmentId)
  .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
  .build();

const getHttpMocks = () =>
  createMocks<GetReturnedToMakerRequest>({
    params: { facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.CHECKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

describe('getReturnedToMaker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(api, 'getAmendment').mockImplementation(getAmendmentMock);

    getAmendmentMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render the return amendment to maker template', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getReturnedToMaker(req, res);

    const expectedViewModel = {
      returnedToMaker: true,
    };

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/submitted-page.njk');
    expect(res._getRenderData()).toEqual(expectedViewModel);
  });

  it('should call getAmendment with the correct variables', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getReturnedToMaker(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
  });

  describe('when the amendment is not found', () => {
    beforeEach(() => {
      getAmendmentMock.mockResolvedValue(undefined);
    });

    it('should redirect to /not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnedToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/not-found`);
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnedToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Amendment %s not found for the facility %s', amendmentId, facilityId);
    });
  });

  describe('when the amendment has the wrong status', () => {
    beforeEach(() => {
      amendment.status = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
      getAmendmentMock.mockResolvedValue(amendment);
    });

    it('should redirect to /not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnedToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/not-found`);
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnedToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        `Amendment %s on facility %s is not ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED}`,
        amendmentId,
        facilityId,
      );
    });
  });

  describe('when getAmendment throws an error', () => {
    beforeEach(() => {
      getAmendmentMock.mockRejectedValue(mockError);
    });

    it('should render `problem with service` if getAmendment throws an error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnedToMaker(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnedToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error getting approval by ukef page %o', mockError);
    });
  });
});

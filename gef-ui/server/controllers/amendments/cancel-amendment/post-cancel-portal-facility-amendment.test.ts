/* eslint-disable import/first */
const deleteAmendmentMock = jest.fn();

import httpMocks from 'node-mocks-http';
import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { postCancelPortalFacilityAmendment, PostCancelPortalFacilityAmendmentRequest } from './post-cancel-portal-facility-amendment';

jest.mock('../../../services/api', () => ({
  deleteAmendment: deleteAmendmentMock,
}));

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const aMockError = () => new Error();

const mockUser = aPortalSessionUser();
const userToken = 'userToken';

const getHttpMocks = () =>
  httpMocks.createMocks<PostCancelPortalFacilityAmendmentRequest>({
    params: {
      dealId,
      facilityId,
      amendmentId,
    },
    session: {
      user: mockUser,
      userToken,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

describe('postCancelPortalFacilityAmendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');

    deleteAmendmentMock.mockResolvedValue(undefined);
  });

  it('should call deleteAmendment with the correct facilityId, amendmentId, and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
    expect(deleteAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken });
  });

  it('should redirect to details page after amendment has been deleted', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
    expect(res._getRedirectUrl()).toEqual(`/gef/application-details/${dealId}`);
  });

  it('should render problem with service if deleteAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    deleteAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting cancel amendments page %o', mockError);
  });
});

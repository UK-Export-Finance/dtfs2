// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const upsertAmendmentMock = jest.fn();

import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, ROLES, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { GetFacilityValueRequest } from '../facility-value/get-facility-value';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { postCreateDraftFacilityAmendment } from './post-create-draft';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

jest.mock('../../../services/api', () => ({
  upsertAmendment: upsertAmendmentMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const getHttpMocks = () =>
  createMocks<GetFacilityValueRequest>({
    params: { dealId, facilityId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

describe('postCreateDraftFacilityAmendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    upsertAmendmentMock.mockResolvedValue(
      new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build(),
    );
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call upsertAmendment with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postCreateDraftFacilityAmendment(req, res);

    // Assert
    expect(upsertAmendmentMock).toHaveBeenCalledTimes(1);
    expect(upsertAmendmentMock).toHaveBeenCalledWith({ facilityId, dealId, amendment: {}, userToken: req.session.userToken });
  });

  it("should redirect to the 'what do you need to change' page ", async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postCreateDraftFacilityAmendment(req, res);

    // Assert

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(
      `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`,
    );
  });

  it('should render problem with service if upsertAmendment throws an error', async () => {
    // Arrange
    upsertAmendmentMock.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await postCreateDraftFacilityAmendment(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});

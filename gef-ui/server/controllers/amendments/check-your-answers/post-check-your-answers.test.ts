// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const updateAmendmentStatusMock = jest.fn();

import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, PORTAL_LOGIN_STATUS, PortalFacilityAmendmentWithUkefId, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { getNextPage } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment.ts';
import { postCheckYourAnswers, PostCheckYourAnswersRequest } from './post-check-your-answers.ts';

jest.mock('../../../services/api', () => ({
  updateAmendmentStatus: updateAmendmentStatusMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const mockUser = aPortalSessionUser();
const userToken = 'userToken';

const getHttpMocks = () =>
  httpMocks.createMocks<PostCheckYourAnswersRequest>({
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

describe('postCheckYourAnswers', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
      .build();

    updateAmendmentStatusMock.mockResolvedValue(amendment);
  });

  it('should call updateAmendmentStatus', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postCheckYourAnswers(req, res);

    // Assert
    expect(updateAmendmentStatusMock).toHaveBeenCalledTimes(1);
    expect(updateAmendmentStatusMock).toHaveBeenCalledWith({
      facilityId,
      amendmentId,
      newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      userToken,
    });
  });

  it('should redirect to the next page', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postCheckYourAnswers(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.CHECK_YOUR_ANSWERS, amendment));
  });

  it('should render `problem with service` if updateAmendmentStatus throws an error', async () => {
    // Arrange
    const mockError = new Error('an error');
    updateAmendmentStatusMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postCheckYourAnswers(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments check your answers page %o', mockError);
  });
});

/* eslint-disable import/first */
const getAmendmentMock = jest.fn();

import { format, fromUnixTime } from 'date-fns';
import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, PORTAL_LOGIN_STATUS, ROLES, PortalFacilityAmendmentWithUkefId, PORTAL_AMENDMENT_STATUS, DATE_FORMATS } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { getApprovedByUkef, GetApprovedByUkefRequest } from './get-approved-by-ukef.ts';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';

jest.mock('../../../services/api', () => ({
  getAmendment: getAmendmentMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const getHttpMocks = () =>
  createMocks<GetApprovedByUkefRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

describe('getApprovedByUkef', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
      .withEffectiveDate(1743524576)
      .build();

    getAmendmentMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call getAmendment with the correct facilityId, amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getApprovedByUkef(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
  });

  it('should render the submitted page template with the correct variables', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getApprovedByUkef(req, res);

    const effectiveDate = format(fromUnixTime(Number(amendment.effectiveDate)), DATE_FORMATS.D_MMMM_YYYY);

    const expectedRenderData = {
      approvedByUkef: true,
      effectiveDate,
      referenceNumber: amendment.referenceNumber,
    };

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/submitted-page.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should redirect to "/not-found" if the amendment is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(undefined);

    // Act
    await getApprovedByUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it(`should redirect to not found if the amendment is not ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED}`, async () => {
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
    await getApprovedByUkef(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('should render problem with service if getAmendment throws an error', async () => {
    // Arrange
    getAmendmentMock.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await getApprovedByUkef(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});

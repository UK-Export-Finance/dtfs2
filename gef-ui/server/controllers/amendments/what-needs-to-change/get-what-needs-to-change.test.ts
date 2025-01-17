// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

import { createMocks } from 'node-mocks-http';
import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  aPortalSessionUser,
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  Facility,
  PORTAL_LOGIN_STATUS,
  PortalFacilityAmendmentWithUkefId,
  ROLES,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { getAmendmentsUrl } from '../helpers/navigation.helper.ts';
import { WhatNeedsToChangeViewModel } from '../../../types/view-models/amendments/what-needs-to-change-view-model.ts';
import { getWhatNeedsToChange, GetWhatNeedsToChangeRequest } from './get-what-needs-to-change.ts';
import { STB_PIM_EMAIL } from '../../../constants/emails.ts';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment.ts';
import { Deal } from '../../../types/deal.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
}));

console.error = jest.fn();

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const aMockError = () => new Error();
const mockError = aMockError();

const companyName = 'company name ltd';
const userToken = 'userToken';

const generalConsoleErrorText = 'Error getting amendments what needs to change page %o';
const facilityOrDealNotFoundConsoleErrorText = 'Deal %s or Facility %s was not found';
const amendmentNotFoundConsoleErrorText = 'Amendment %s not found on facility %s';
const userCannotAmendFacilityErrorText = 'User cannot amend facility %s on deal %s';

const getHttpMocks = () =>
  createMocks<GetWhatNeedsToChangeRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { exporter: { companyName }, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as Deal;

const mockFacility = {
  hasBeenIssued: true,
} as Facility;

describe('getWhatNeedsToChange', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build();

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
    await getWhatNeedsToChange(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should call getAmendment with the correct facilityId, amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should render the "What do you need to change?" template the with correct data when changeFacilityValue and changeFacilityEndDate are undefined', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValueOnce(amendment);

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    const expectedRenderData: WhatNeedsToChangeViewModel = {
      exporterName: companyName,
      previousPage: `/gef/application-details/${dealId}`,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      amendmentFormEmail: STB_PIM_EMAIL,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/what-needs-to-change.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should render the "What do you need to change?" template the with correct data when changeFacilityValue and changeFacilityEndDate have existing values', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const amendmentWithChangeValues = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeFacilityValue(true)
      .withChangeCoverEndDate(false)
      .build();

    getAmendmentMock.mockResolvedValueOnce(amendmentWithChangeValues);

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    const expectedRenderData: WhatNeedsToChangeViewModel = {
      exporterName: companyName,
      previousPage: `/gef/application-details/${dealId}`,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      amendmentFormEmail: STB_PIM_EMAIL,
      changeFacilityValue: true,
      changeCoverEndDate: false,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/what-needs-to-change.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(facilityOrDealNotFoundConsoleErrorText, dealId, facilityId);
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(facilityOrDealNotFoundConsoleErrorText, dealId, facilityId);
  });

  it('should redirect if the amendment is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(undefined);

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(amendmentNotFoundConsoleErrorText, amendmentId, facilityId);
  });

  it('should redirect if the facility cannot be amended', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: { ...mockFacility, hasBeenIssued: false } });

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/gef/application-details/${dealId}`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(userCannotAmendFacilityErrorText, facilityId, dealId);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    // Arrange
    getApplicationMock.mockRejectedValueOnce(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(generalConsoleErrorText, mockError);
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    // Arrange
    getFacilityMock.mockRejectedValueOnce(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(generalConsoleErrorText, mockError);
  });

  it('should render `problem with service` if getAmendment throws an error', async () => {
    // Arrange
    getAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await getWhatNeedsToChange(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(generalConsoleErrorText, mockError);
  });
});

// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const updateAmendmentMock = jest.fn();

import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  aPortalSessionUser,
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  PORTAL_LOGIN_STATUS,
  ROLES,
  PortalFacilityAmendmentWithUkefId,
  PORTAL_AMENDMENT_STATUS,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { DoYouHaveAFacilityEndDateViewModel } from '../../../types/view-models/amendments/do-you-have-a-facility-end-date-view-model';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper';
import { postDoYouHaveAFacilityEndDate, PostDoYouHaveAFacilityEndDateRequest } from './post-do-you-have-a-facility-end-date';
import { validationErrorHandler } from '../../../utils/helpers';
import { validateIsUsingFacilityEndDate } from './validation';
import { ValidationError } from '../../../types/validation-error';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
  updateAmendment: updateAmendmentMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const previousPage = 'previousPage';

const userToken = 'testToken';

const aMockError = () => new Error();

const getHttpMocks = (isUsingFacilityEndDate: string | undefined) =>
  createMocks<PostDoYouHaveAFacilityEndDateRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
    body: {
      isUsingFacilityEndDate,
      previousPage,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('postDoYouHaveAFacilityEndDate', () => {
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
      .withChangeCoverEndDate(true)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
    updateAmendmentMock.mockResolvedValue(amendment);
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks('true');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks('true');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks('true');
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks('true');
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should not call updateAmendment if isUsingFacilityEndDate is not set', async () => {
    // Arrange
    const isUsingFacilityEndDate = undefined;
    const { req, res } = getHttpMocks(isUsingFacilityEndDate);
    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(0);
  });

  it('should render the page with validation errors if isUsingFacilityEndDate is not set', async () => {
    // Arrange
    const isUsingFacilityEndDate = undefined;
    const { req, res } = getHttpMocks(isUsingFacilityEndDate);

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    const canMakerCancelAmendment = amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT;
    const expectedRenderData: DoYouHaveAFacilityEndDateViewModel = {
      exporterName: mockDeal.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage,
      errors: validationErrorHandler((validateIsUsingFacilityEndDate(isUsingFacilityEndDate) as { errors: ValidationError[] }).errors),
      isUsingFacilityEndDate,
      canMakerCancelAmendment,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/do-you-have-a-facility-end-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should call updateAmendment if isUsingFacilityEndDate is `true`', async () => {
    // Arrange
    const { req, res } = getHttpMocks('true');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
    expect(updateAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, update: { isUsingFacilityEndDate: true }, userToken });
  });

  it('should not call console.error if isUsingFacilityEndDate is `true`', async () => {
    // Arrange
    const { req, res } = getHttpMocks('true');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should redirect to the next page if isUsingFacilityEndDate is `true`', async () => {
    // Arrange
    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeCoverEndDate(true)
      .withIsUsingFacilityEndDate(true)
      .build();
    updateAmendmentMock.mockResolvedValue(amendment);

    const { req, res } = getHttpMocks('true');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE, amendment));
  });

  it('should call updateAmendment if isUsingFacilityEndDate is `false`', async () => {
    // Arrange
    const { req, res } = getHttpMocks('false');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
    expect(updateAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, update: { isUsingFacilityEndDate: false }, userToken });
  });

  it('should not call console.error if isUsingFacilityEndDate is `false`', async () => {
    // Arrange
    const { req, res } = getHttpMocks('false');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should redirect to the next page if isUsingFacilityEndDate is `false`', async () => {
    // Arrange
    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeCoverEndDate(true)
      .withIsUsingFacilityEndDate(false)
      .build();
    updateAmendmentMock.mockResolvedValue(amendment);

    const { req, res } = getHttpMocks('false');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE, amendment));
  });

  it('should render problem with service if getApplication throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getApplicationMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks('true');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments do you have a facility end date page %o', mockError);
  });

  it('should render problem with service if getFacility throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks('true');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments do you have a facility end date page %o', mockError);
  });

  it('should render problem with service if updateAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    updateAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks('true');

    // Act
    await postDoYouHaveAFacilityEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments do you have a facility end date page %o', mockError);
  });
});

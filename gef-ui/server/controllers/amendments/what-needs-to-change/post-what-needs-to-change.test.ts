// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const updateAmendmentMock = jest.fn();

import { createMocks } from 'node-mocks-http';
import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_LOGIN_STATUS, PortalFacilityAmendmentWithUkefId, ROLES } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PostWhatNeedsToChangeRequest, postWhatNeedsToChange } from './post-what-needs-to-change.ts';
import { WhatNeedsToChangeViewModel } from '../../../types/view-models/amendments/what-needs-to-change-view-model.ts';
import { STB_PIM_EMAIL } from '../../../constants/emails.ts';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment.ts';
import { Deal } from '../../../types/deal.ts';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper.ts';
import { validateWhatNeedsToChange } from './validation.ts';
import { ValidationError } from '../../../types/validation-error.ts';
import { validationErrorHandler } from '../../../utils/helpers';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
  updateAmendment: updateAmendmentMock,
}));

console.error = jest.fn();

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const aMockError = () => new Error();
const mockError = aMockError();

const companyName = 'company name ltd';
const userToken = 'userToken';

const generalConsoleErrorText = 'Error posting amendments what needs to change page %o';
const facilityOrDealNotFoundConsoleErrorText = 'Deal %s or Facility %s was not found';

const getHttpMocks = (amendmentOptions: string[] = ['changeCoverEndDate', 'changeFacilityValue']) =>
  createMocks<PostWhatNeedsToChangeRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
    body: {
      amendmentOptions,
    },
  });

const mockDeal = { exporter: { companyName }, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as Deal;

describe('postWhatNeedsToChange', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
    updateAmendmentMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should call getAmendment with the correct amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should not call updateAmendment if neither of changeCoverEndDate or changeFacilityValue are true', async () => {
    // Arrange
    const { req, res } = getHttpMocks([]);

    // Act
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should render the page with validation errors if an invalid selection has been made', async () => {
    // Arrange
    const changeCoverEndDate = false;
    const changeFacilityValue = false;
    const { req, res } = getHttpMocks([]);

    // Act
    await postWhatNeedsToChange(req, res);

    // Assert
    const expectedErrors = validationErrorHandler(validateWhatNeedsToChange({ changeCoverEndDate, changeFacilityValue }) as ValidationError);

    const expectedRenderData: WhatNeedsToChangeViewModel = {
      exporterName: companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      previousPage: `/gef/application-details/${dealId}`,
      amendmentFormEmail: STB_PIM_EMAIL,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      changeCoverEndDate,
      changeFacilityValue,
      errors: expectedErrors,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/what-needs-to-change.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should call updateAmendment when the selected values are valid', async () => {
    // Arrange
    const { req, res } = getHttpMocks(['changeCoverEndDate']);

    // Act
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
    expect(updateAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, update: { changeCoverEndDate: true, changeFacilityValue: false }, userToken });
  });

  it('should not call console.error if the selected values are valid', async () => {
    // Arrange
    const { req, res } = getHttpMocks(['changeCoverEndDate']);

    // Act
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should redirect to the next page if selected values are valid', async () => {
    // Arrange
    const { req, res } = getHttpMocks(['changeCoverEndDate', 'changeFacilityValue']);

    // Act
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE, amendment));
  });

  it('should redirect to the next page if selected values are valid and change query param is true', async () => {
    // Arrange
    const { req, res } = getHttpMocks(['changeCoverEndDate', 'changeFacilityValue']);
    req.query = { change: 'true' };

    // Act
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE, amendment, req.query.change === 'true'));
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await postWhatNeedsToChange(req, res);

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
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(facilityOrDealNotFoundConsoleErrorText, dealId, facilityId);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    // Arrange
    getApplicationMock.mockRejectedValueOnce(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postWhatNeedsToChange(req, res);

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
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(generalConsoleErrorText, mockError);
  });

  it('should render `problem with service` if updateAmendment throws an error', async () => {
    // Arrange
    updateAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postWhatNeedsToChange(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(generalConsoleErrorText, mockError);
  });
});

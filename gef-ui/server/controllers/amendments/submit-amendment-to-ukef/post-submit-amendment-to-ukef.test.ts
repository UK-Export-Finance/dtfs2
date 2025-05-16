import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  aPortalSessionUser,
  PORTAL_LOGIN_STATUS,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  PortalFacilityAmendmentWithUkefId,
  PORTAL_AMENDMENT_STATUS,
} from '@ukef/dtfs2-common';
import api from '../../../services/api';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { getAmendmentsUrl } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { postSubmitAmendmentToUkef, PostSubmitAmendmentToUkefRequest } from './post-submit-amendment-to-ukef';
import * as createReferenceNumberHelper from '../helpers/create-amendment-reference-number.helper';

console.error = jest.fn();
const getApplicationMock = jest.fn();
const updateSubmittedAmendmentMock = jest.fn();
const createReferenceNumberMock = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const aMockError = () => new Error();

const mockUser = aPortalSessionUser();
const userToken = 'userToken';

const getHttpMocks = (confirmSubmitUkefParam: boolean = true) =>
  httpMocks.createMocks<PostSubmitAmendmentToUkefRequest>({
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
    body: {
      confirmSubmitUkef: confirmSubmitUkefParam,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };
const referenceNumber = `${facilityId}-001`;

describe('postSubmitAmendmentToUkef', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'updateSubmitAmendment').mockImplementation(updateSubmittedAmendmentMock);
    jest.spyOn(createReferenceNumberHelper, 'createReferenceNumberHelper').mockImplementation(createReferenceNumberMock);

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    createReferenceNumberMock.mockResolvedValue(referenceNumber);
    updateSubmittedAmendmentMock.mockResolvedValue(amendment);
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call createReferenceNumber with the correct dealId facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(createReferenceNumberMock).toHaveBeenCalledTimes(1);
    expect(createReferenceNumberMock).toHaveBeenCalledWith(dealId, facilityId, req.session.userToken);
  });

  it('should not call updateSubmittedAmendment if the confirmSubmitUkef is false', async () => {
    // Arrange
    const confirmSubmitUkefParam = false;
    const { req, res } = getHttpMocks(confirmSubmitUkefParam);

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(updateSubmittedAmendmentMock).toHaveBeenCalledTimes(0);
  });

  it('should render the page with validation errors if the confirmSubmitUkef is false', async () => {
    // Arrange
    const confirmSubmitUkefParam = false;
    const { req, res } = getHttpMocks(confirmSubmitUkefParam);

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/submit-to-ukef.njk');
  });

  it('should call updateSubmittedAmendment if the confirmSubmitUkef is true', async () => {
    // Arrange
    const status = PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED;
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(updateSubmittedAmendmentMock).toHaveBeenCalledTimes(1);
    expect(updateSubmittedAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, referenceNumber, status, userToken });
  });

  it('should redirect to approved by Ukef page If confirmSubmitUkef is true', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.APPROVED_BY_UKEF }));
  });

  it('should redirect to "/not-found" if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s was not found', dealId);
  });

  it('should redirect to "/not-found" if the reference number is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    createReferenceNumberMock.mockResolvedValue(undefined);

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Reference number could not be created for deal %s and facility %s', dealId, facilityId);
  });

  it('should render problem with service if getApplication throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getApplicationMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting submitted amendment to UKEF %o', mockError);
  });

  it('should render problem with service if createReferenceNumber throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    createReferenceNumberMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting submitted amendment to UKEF %o', mockError);
  });

  it('should render problem with service if updateSubmittedAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    updateSubmittedAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting submitted amendment to UKEF %o', mockError);
  });
});

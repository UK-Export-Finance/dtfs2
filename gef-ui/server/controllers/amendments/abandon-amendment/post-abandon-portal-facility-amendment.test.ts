import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { format, fromUnixTime } from 'date-fns';
import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  PORTAL_LOGIN_STATUS,
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  PORTAL_AMENDMENT_STATUS,
  PortalFacilityAmendmentWithUkefId,
  DATE_FORMATS,
} from '@ukef/dtfs2-common';
import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import api from '../../../services/api';
import { postAbandonPortalFacilityAmendment, PostAbandonPortalFacilityAmendmentRequest } from './post-abandon-portal-facility-amendment';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { getCurrencySymbol } from '../../../utils/get-currency-symbol';

const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const getUserDetailsMock = jest.fn();
const deleteAmendmentMock = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const aMockError = () => new Error();

const facilityValue = 20000;

const effectiveDateWithoutMs = Number(new Date()) / 1000;
const coverEndDate = Number(new Date());
const facilityEndDate = new Date();

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED, submissionCount: 1 };
const mockFacilityDetails = MOCK_ISSUED_FACILITY.details;

const mockUser = aPortalSessionUser();
const userToken = 'userToken';

const getHttpMocks = () =>
  httpMocks.createMocks<PostAbandonPortalFacilityAmendmentRequest>({
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

describe('postAbandonPortalFacilityAmendment', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'getFacility').mockImplementation(getFacilityMock);
    jest.spyOn(api, 'getAmendment').mockImplementation(getAmendmentMock);
    jest.spyOn(api, 'getUserDetails').mockImplementation(getUserDetailsMock);
    jest.spyOn(api, 'deleteAmendment').mockImplementation(deleteAmendmentMock);
    jest.spyOn(console, 'error');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withStatus(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED)
      .withChangeCoverEndDate(true)
      .withCoverEndDate(coverEndDate)
      .withIsUsingFacilityEndDate(true)
      .withFacilityEndDate(facilityEndDate)
      .withChangeFacilityValue(true)
      .withFacilityValue(facilityValue)
      .withEffectiveDate(effectiveDateWithoutMs)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
    getUserDetailsMock.mockResolvedValue(mockUser);
    deleteAmendmentMock.mockResolvedValue(undefined);
  });

  it('should call deleteAmendment with the correct facilityId, amendmentId, userToken and email variables', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postAbandonPortalFacilityAmendment(req, res);

    // Assert
    expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
    expect(deleteAmendmentMock).toHaveBeenCalledWith({
      facilityId,
      amendmentId,
      userToken,
      makersEmail: mockUser.email,
      checkersEmail: mockUser.email,
      emailVariables: {
        ukefDealId: mockDeal.ukefDealId,
        bankInternalRefName: String(mockDeal.bankInternalRefName),
        exporterName: mockDeal.exporter.companyName,
        ukefFacilityId: mockFacilityDetails.ukefFacilityId,
        dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
        newCoverEndDate: format(new Date(coverEndDate), DATE_FORMATS.DD_MMMM_YYYY),
        newFacilityEndDate: format(new Date(facilityEndDate), DATE_FORMATS.DD_MMMM_YYYY),
        newFacilityValue: `${getCurrencySymbol(mockFacilityDetails?.currency!.id)}${facilityValue}`,
        makersName: `${mockUser.firstname} ${mockUser.surname}`,
        checkersName: `${mockUser.firstname} ${mockUser.surname}`,
        checkersEmail: mockUser.email,
      },
    });
  });

  it('should render the amendment has been abandoned template', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postAbandonPortalFacilityAmendment(req, res);

    const expectedViewModel = {
      abandoned: true,
    };

    // Assert
    expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/submitted-page.njk');
    expect(res._getRenderData()).toEqual(expectedViewModel);
  });

  it('should redirect to "/not-found" if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await postAbandonPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect to "/not-found" if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await postAbandonPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect to "/not-found" if the amendment is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(undefined);

    // Act
    await postAbandonPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s was not found for the facility %s', amendmentId, facilityId);
  });

  it('should render problem with service if getApplication throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getApplicationMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postAbandonPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting to facility amendment abandonment page %o', mockError);
  });

  it('should render problem with service if getFacility throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postAbandonPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting to facility amendment abandonment page %o', mockError);
  });

  it('should render problem with service if getAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postAbandonPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting to facility amendment abandonment page %o', mockError);
  });

  it('should render problem with service if deleteAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    deleteAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postAbandonPortalFacilityAmendment(req, res);

    // Assert
    expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting to facility amendment abandonment page %o', mockError);
  });
});

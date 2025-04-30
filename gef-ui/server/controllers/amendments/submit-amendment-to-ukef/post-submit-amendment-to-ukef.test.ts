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
  DATE_FORMATS,
  generateAmendmentMandatoryCriteria,
} from '@ukef/dtfs2-common';
import { format, fromUnixTime } from 'date-fns';
import api from '../../../services/api';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { getAmendmentsUrl } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { postSubmitAmendmentToUkef, PostSubmitAmendmentToUkefRequest } from './post-submit-amendment-to-ukef';
import * as createReferenceNumber from '../helpers/create-amendment-reference-number.helper';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { MOCK_PIM_TEAM } from '../../../utils/mocks/mock-tfm-teams.ts';
import { getCurrencySymbol } from '../facility-value/get-currency-symbol';

console.error = jest.fn();
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const updateSubmittedAmendmentMock = jest.fn();
const createReferenceNumberMock = jest.fn();
const getTfmTeamMock = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const teamId = String(dtfsCommon.TEAM_IDS.PIM);

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

const facilityValue = 20000;

const effectiveDateWithoutMs = Number(new Date()) / 1000;
const coverEndDate = Number(new Date());
const facilityEndDate = new Date();

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };
const mockFacilityDetails = MOCK_ISSUED_FACILITY.details;
const referenceNumber = `123456-01`;

describe('postSubmitAmendmentToUkef', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;
  let submittedAmendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'getFacility').mockImplementation(getFacilityMock);
    jest.spyOn(api, 'getAmendment').mockImplementation(getAmendmentMock);
    jest.spyOn(api, 'updateSubmitAmendment').mockImplementation(updateSubmittedAmendmentMock);
    jest.spyOn(api, 'getTfmTeam').mockImplementation(getTfmTeamMock);
    jest.spyOn(createReferenceNumber, 'createReferenceNumber').mockImplementation(createReferenceNumberMock);

    const criteria = [
      {
        id: 1,
        text: 'Criterion 1',
        answer: null,
      },
      {
        id: 2,
        text: 'Criterion 2',
        textList: ['bullet 1', 'bullet 2'],
        answer: null,
      },
      {
        id: 3,
        text: 'Criterion 3',
        answer: null,
      },
    ];

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withCriteria(criteria)
      .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
      .withChangeCoverEndDate(true)
      .withCoverEndDate(coverEndDate)
      .withIsUsingFacilityEndDate(true)
      .withFacilityEndDate(facilityEndDate)
      .withChangeFacilityValue(true)
      .withFacilityValue(facilityValue)
      .withEffectiveDate(effectiveDateWithoutMs)
      .build();

    submittedAmendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withCriteria(criteria)
      .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
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
    createReferenceNumberMock.mockResolvedValue(referenceNumber);
    updateSubmittedAmendmentMock.mockResolvedValue(submittedAmendment);
    getTfmTeamMock.mockResolvedValue(MOCK_PIM_TEAM);
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

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should call getAmendment with the correct facilityId, amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
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
    expect(updateSubmittedAmendmentMock).toHaveBeenCalledWith({
      facilityId,
      amendmentId,
      referenceNumber,
      status,
      userToken,
      makersEmail: mockDeal.maker.email,
      checkersEmail: mockUser.email,
      pimEmail: MOCK_PIM_TEAM.email,
      emailVariables: {
        ukefDealId: mockDeal.ukefDealId,
        bankInternalRefName: String(mockDeal.bankInternalRefName),
        exporterName: mockDeal.exporter.companyName,
        ukefFacilityId: mockFacilityDetails.ukefFacilityId,
        dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
        newCoverEndDate: format(new Date(coverEndDate), DATE_FORMATS.DD_MMMM_YYYY),
        newFacilityEndDate: format(new Date(facilityEndDate), DATE_FORMATS.DD_MMMM_YYYY),
        newFacilityValue: `${getCurrencySymbol(mockFacilityDetails?.currency!.id)}${facilityValue}`,
        makersName: `${mockDeal.maker.firstname} ${mockDeal.maker.surname}`,
        checkersName: `${mockUser.firstname} ${mockUser.surname}`,
        makersEmail: mockDeal.maker.email,
        bankName: mockDeal.maker.bank.name,
        eligibilityCriteria: generateAmendmentMandatoryCriteria(submittedAmendment.eligibilityCriteria?.criteria),
        referenceNumber,
      },
    });
  });

  it('should call getTfmTeam with the correct teamId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(getTfmTeamMock).toHaveBeenCalledTimes(1);
    expect(getTfmTeamMock).toHaveBeenCalledWith({ teamId, userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should throw an error if getTfmTeam API call throws an exception', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const error = new Error('Test error');

    getTfmTeamMock.mockRejectedValueOnce(error);

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(getTfmTeamMock).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting submitted amendment to UKEF %o', error);
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
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
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect to "/not-found" if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await postSubmitAmendmentToUkef(req, res);

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
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s was not found for the facility %s', amendmentId, facilityId);
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

  it('should render problem with service if getFacility throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postSubmitAmendmentToUkef(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting submitted amendment to UKEF %o', mockError);
  });

  it('should render problem with service if getAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getAmendmentMock.mockRejectedValue(mockError);
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

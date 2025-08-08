// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const updateAmendmentStatusMock = jest.fn();
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getTfmFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const getUserDetailsMock = jest.fn();
const updateAmendmentMock = jest.fn();

import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { format, fromUnixTime } from 'date-fns';
import dotenv from 'dotenv';
import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  aPortalSessionUser,
  PORTAL_LOGIN_STATUS,
  PORTAL_AMENDMENT_STATUS,
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  DATE_FORMATS,
  MOCK_TFM_FACILITY,
} from '@ukef/dtfs2-common';
import { getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { postCheckYourAnswers, PostCheckYourAnswersRequest } from './post-check-your-answers';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { Deal } from '../../../types/deal';
import { getCurrencySymbol } from '../../../utils/get-currency-symbol';
import { mockFacility } from '../../../utils/mocks/mock-facility';
import { addExposureValuesToAmendment } from '../helpers/add-exposure-values-to-amendment';

jest.mock('../../../services/api', () => ({
  updateAmendmentStatus: updateAmendmentStatusMock,
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getTfmFacility: getTfmFacilityMock,
  getAmendment: getAmendmentMock,
  getUserDetails: getUserDetailsMock,
  updateAmendment: updateAmendmentMock,
}));

dotenv.config();

const { PORTAL_UI_URL } = process.env;

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const mockUser = aPortalSessionUser();
const userToken = 'userToken';

const mockChecker = {
  ...mockUser,
  firstname: 'checkerFirst',
  surname: 'checkerLast',
  email: 'checker@ukexportfinance.gov.uk',
};

const facilityValue = 12345;

const effectiveDateWithoutMs = Number(new Date()) / 1000;
const coverEndDate = Number(new Date());
const facilityEndDate = new Date();

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;
const mockFacilityDetails = MOCK_ISSUED_FACILITY.details;

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
  const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
    .withDealId(dealId)
    .withFacilityId(facilityId)
    .withAmendmentId(amendmentId)
    .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
    .withChangeCoverEndDate(true)
    .withCoverEndDate(coverEndDate)
    .withIsUsingFacilityEndDate(true)
    .withFacilityEndDate(facilityEndDate)
    .withChangeFacilityValue(true)
    .withFacilityValue(facilityValue)
    .withEffectiveDate(effectiveDateWithoutMs)
    .build();

  const facility = mockFacility(facilityId, mockDeal._id);

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(facility);
    getTfmFacilityMock.mockResolvedValue(MOCK_TFM_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
    getUserDetailsMock.mockResolvedValue(mockChecker);

    updateAmendmentStatusMock.mockResolvedValue(amendment);
    updateAmendmentMock.mockResolvedValue(amendment);
  });

  describe('when an amendment has all types of amendments', () => {
    it('should call updateAmendment', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postCheckYourAnswers(req, res);

      const { tfmUpdate } = await addExposureValuesToAmendment(amendment, facility.details, facilityId, userToken);

      const update = { tfm: tfmUpdate };

      // Assert
      expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
      expect(updateAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, update, userToken });
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
        makersEmail: mockUser.email,
        checkersEmail: mockChecker.email,
        emailVariables: {
          exporterName: mockDeal.exporter.companyName,
          bankInternalRefName: mockDeal.bankInternalRefName!,
          ukefDealId: mockDeal.ukefDealId,
          ukefFacilityId: facility.details.ukefFacilityId,
          dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
          newCoverEndDate: format(new Date(coverEndDate), DATE_FORMATS.DD_MMMM_YYYY),
          newFacilityEndDate: format(new Date(facilityEndDate), DATE_FORMATS.DD_MMMM_YYYY),
          newFacilityValue: `${getCurrencySymbol(mockFacilityDetails?.currency!.id)}${facilityValue}`,
          makersName: `${mockUser.firstname} ${mockUser.surname}`,
          checkersName: `${mockChecker.firstname} ${mockChecker.surname}`,
          dateSubmittedByMaker: format(new Date(), DATE_FORMATS.DD_MMMM_YYYY),
          portalUrl: `${PORTAL_UI_URL}/login`,
          makersEmail: mockUser.email,
        },
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
  });

  describe('when an amendment does not have a facility value', () => {
    it('should NOT call updateAmendment', async () => {
      const amendmentWithoutFacilityValue = {
        ...amendment,
        changeFacilityValue: false,
        value: null,
      };
      getAmendmentMock.mockResolvedValue(amendmentWithoutFacilityValue);

      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postCheckYourAnswers(req, res);

      // Assert
      expect(updateAmendmentMock).toHaveBeenCalledTimes(0);
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
        makersEmail: mockUser.email,
        checkersEmail: mockChecker.email,
        emailVariables: {
          exporterName: mockDeal.exporter.companyName,
          bankInternalRefName: mockDeal.bankInternalRefName!,
          ukefDealId: mockDeal.ukefDealId,
          ukefFacilityId: facility.details.ukefFacilityId,
          dateEffectiveFrom: format(fromUnixTime(effectiveDateWithoutMs), DATE_FORMATS.DD_MMMM_YYYY),
          newCoverEndDate: format(new Date(coverEndDate), DATE_FORMATS.DD_MMMM_YYYY),
          newFacilityEndDate: format(new Date(facilityEndDate), DATE_FORMATS.DD_MMMM_YYYY),
          newFacilityValue: `${getCurrencySymbol(mockFacilityDetails?.currency!.id)}${facilityValue}`,
          makersName: `${mockUser.firstname} ${mockUser.surname}`,
          checkersName: `${mockChecker.firstname} ${mockChecker.surname}`,
          dateSubmittedByMaker: format(new Date(), DATE_FORMATS.DD_MMMM_YYYY),
          portalUrl: `${PORTAL_UI_URL}/login`,
          makersEmail: mockUser.email,
        },
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
  });

  describe('when an amendment cannot be found', () => {
    beforeEach(() => {
      getAmendmentMock.mockResolvedValue(null);
    });

    it('should redirect to not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postCheckYourAnswers(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it('should log an error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postCheckYourAnswers(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Amendment %s was not found for the facility %s', amendmentId, facilityId);
    });
  });

  describe('when a deal cannot be found', () => {
    beforeEach(() => {
      getApplicationMock.mockResolvedValue(null);
    });

    it('should redirect to not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postCheckYourAnswers(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it('should log an error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postCheckYourAnswers(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
    });
  });

  describe('when a facility cannot be found', () => {
    beforeEach(() => {
      getFacilityMock.mockResolvedValue({ details: null });
    });

    it('should redirect to not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postCheckYourAnswers(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it('should log an error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postCheckYourAnswers(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
    });
  });

  describe('when a checker cannot be found', () => {
    beforeEach(() => {
      getUserDetailsMock.mockResolvedValue(null);
    });

    it('should redirect to not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postCheckYourAnswers(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it('should log an error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postCheckYourAnswers(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Checker %s was not found from the deal %s', mockDeal.checkerId, dealId);
    });
  });

  it('should render problem with service if updateAmendmentStatus throws an error', async () => {
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

  it('should render problem with service if getTfmFacility throws an error', async () => {
    // Arrange
    const mockError = new Error('an error');
    getTfmFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postCheckYourAnswers(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error fetching TFM facility %s %o', facilityId, mockError);
  });
});

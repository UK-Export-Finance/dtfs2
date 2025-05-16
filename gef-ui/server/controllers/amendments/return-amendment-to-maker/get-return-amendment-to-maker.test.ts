import {
  aPortalSessionUser,
  PORTAL_LOGIN_STATUS,
  ROLES,
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  PORTAL_AMENDMENT_STATUS,
  RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT,
} from '@ukef/dtfs2-common';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import api from '../../../services/api';
import { getReturnAmendmentToMaker, GetReturnToMakerRequest } from './get-return-amendment-to-maker';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

console.error = jest.fn();

const mockError = new Error('test error');

const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

jest.mock('../../../services/api');

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
  .withDealId(dealId)
  .withFacilityId(facilityId)
  .withAmendmentId(amendmentId)
  .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
  .build();

const getHttpMocks = () =>
  createMocks<GetReturnToMakerRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.CHECKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

describe('getReturnAmendmentToMaker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'getFacility').mockImplementation(getFacilityMock);
    jest.spyOn(api, 'getAmendment').mockImplementation(getAmendmentMock);

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render the return amendment to maker template', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getReturnAmendmentToMaker(req, res);

    const expectedViewModel = {
      exporterName: mockDeal.exporter.companyName,
      dealId,
      facilityId,
      amendmentId,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      previousPage: `/gef/application-details/${mockDeal._id}/${PORTAL_AMENDMENT_PAGES.AMENDMENT_DETAILS}`,
      maxCommentLength: RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT,
      isReturningAmendmentToMaker: true,
    };

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/return-to-maker.njk');
    expect(res._getRenderData()).toEqual(expectedViewModel);
  });

  it('should call getAmendment, getFacility and getApplication with the correct variables', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getReturnAmendmentToMaker(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });

    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });

    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  describe('when the deal is not found', () => {
    beforeEach(() => {
      getApplicationMock.mockResolvedValue(undefined);
    });

    it('should redirect to /not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/not-found`);
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
    });
  });

  describe('when the facility is not found', () => {
    beforeEach(() => {
      getFacilityMock.mockResolvedValue({ details: undefined });
    });

    it('should redirect to /not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/not-found`);
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
    });
  });

  describe('when the amendment is not found', () => {
    beforeEach(() => {
      getAmendmentMock.mockResolvedValue(undefined);
    });

    it('should redirect to /not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/not-found`);
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Amendment %s not found for the facility %s', amendmentId, facilityId);
    });
  });

  describe('when the amendment has the wrong status', () => {
    beforeEach(() => {
      amendment.status = PORTAL_AMENDMENT_STATUS.DRAFT;
      getAmendmentMock.mockResolvedValue(amendment);
    });

    it('should redirect to /not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/not-found`);
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        `Amendment %s on facility %s is not ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`,
        amendmentId,
        facilityId,
      );
    });
  });

  describe('when getAmendment throws an error', () => {
    beforeEach(() => {
      getAmendmentMock.mockRejectedValue(mockError);
    });

    it('should render `problem with service` if getAmendment throws an error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error getting return to maker facility amendment page %o', mockError);
    });
  });

  describe('when getApplication throws an error', () => {
    beforeEach(() => {
      getApplicationMock.mockRejectedValue(mockError);
    });

    it('should render `problem with service` if getAmendment throws an error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error getting return to maker facility amendment page %o', mockError);
    });
  });

  describe('when getFacility throws an error', () => {
    beforeEach(() => {
      getFacilityMock.mockRejectedValue(mockError);
    });

    it('should render `problem with service` if getAmendment throws an error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getReturnAmendmentToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error getting return to maker facility amendment page %o', mockError);
    });
  });
});

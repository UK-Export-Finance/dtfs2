// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const updateAmendmentStatusMock = jest.fn();
const getApplicationMock = jest.fn();
const getFacilityMock = jest.fn();
const getAmendmentMock = jest.fn();
const getUserDetailsMock = jest.fn();
const updateApplicationMock = jest.fn();

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
import { postReturnAmendmentToMaker, PostReturnToMakerRequest } from './post-return-amendment-to-maker';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getAmendmentsUrl } from '../helpers/navigation.helper';
import { validationErrorHandler } from '../../../utils/helpers';

console.error = jest.fn();

const mockError = new Error('test error');

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
  updateAmendmentStatus: updateAmendmentStatusMock,
  getUserDetails: getUserDetailsMock,
  updateApplication: updateApplicationMock,
}));

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };
const mockFacilityDetails = MOCK_ISSUED_FACILITY.details;

const mockUser = aPortalSessionUser();

const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
  .withDealId(dealId)
  .withFacilityId(facilityId)
  .withAmendmentId(amendmentId)
  .withStatus(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL)
  .build();

const getHttpMocks = (comment = '') =>
  createMocks<PostReturnToMakerRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.CHECKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
    body: {
      comment,
    },
  });

describe('postReturnAmendmentToMaker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'getFacility').mockImplementation(getFacilityMock);
    jest.spyOn(api, 'getAmendment').mockImplementation(getAmendmentMock);
    jest.spyOn(api, 'updateAmendmentStatus').mockImplementation(updateAmendmentStatusMock);
    jest.spyOn(api, 'getUserDetails').mockImplementation(getUserDetailsMock);
    jest.spyOn(api, 'updateApplication').mockImplementation(updateApplicationMock);

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
    getUserDetailsMock.mockResolvedValue(mockUser);
    updateApplicationMock.mockResolvedValue(mockDeal);

    updateAmendmentStatusMock.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('when no comment is provided', () => {
    it(`should redirect to ${PORTAL_AMENDMENT_PAGES.RETURNED_TO_MAKER}`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.RETURNED_TO_MAKER }));
    });

    it('should call getAmendment, getFacility and getApplication with the correct variables only once', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(getAmendmentMock).toHaveBeenCalledTimes(1);
      expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });

      expect(getApplicationMock).toHaveBeenCalledTimes(1);
      expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });

      expect(getFacilityMock).toHaveBeenCalledTimes(1);
      expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
    });

    it('should NOT call getUserDetails, updateAmendmentStatus', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(getUserDetailsMock).toHaveBeenCalledTimes(0);

      expect(updateApplicationMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('when a comment is provided', () => {
    const mockComment = 'This is a mock comment';

    beforeEach(() => {
      mockDeal.comments = [];
    });

    it(`should redirect to ${PORTAL_AMENDMENT_PAGES.RETURNED_TO_MAKER}`, async () => {
      // Arrange
      const { req, res } = getHttpMocks(mockComment);

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.RETURNED_TO_MAKER }));
    });

    it('should call getAmendment, getFacility and getApplication with the correct variables once', async () => {
      // Arrange
      const { req, res } = getHttpMocks(mockComment);

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(getAmendmentMock).toHaveBeenCalledTimes(1);
      expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });

      expect(getApplicationMock).toHaveBeenCalledTimes(2);
      expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });

      expect(getFacilityMock).toHaveBeenCalledTimes(1);
      expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
    });

    it('should call getUserDetails, updateAmendmentStatus', async () => {
      // Arrange
      const { req, res } = getHttpMocks(mockComment);

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(getUserDetailsMock).toHaveBeenCalledTimes(1);
      expect(getUserDetailsMock).toHaveBeenCalledWith({ userId: mockUser._id, userToken: req.session.userToken });

      const expectedApplication = {
        ...mockDeal,
        checkerId: mockUser._id,
        comments: [
          {
            roles: mockUser.roles,
            userName: mockUser.username,
            firstname: mockUser.firstname,
            surname: mockUser.surname,
            email: mockUser.email,
            createdAt: expect.any(Number) as number,
            comment: mockComment,
          },
        ],
      };

      expect(updateApplicationMock).toHaveBeenCalledTimes(1);
      expect(updateApplicationMock).toHaveBeenCalledWith({
        dealId,
        application: expectedApplication,
        userToken: req.session.userToken,
      });
    });

    it('should call updateAmendmentStatus with the correct variables once', async () => {
      // Arrange
      const { req, res } = getHttpMocks(mockComment);

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(updateAmendmentStatusMock).toHaveBeenCalledTimes(1);
      expect(updateAmendmentStatusMock).toHaveBeenLastCalledWith({
        facilityId,
        amendmentId,
        newStatus: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
        userToken: req.session.userToken,
        makersEmail: mockDeal.maker.email,
        checkersEmail: mockUser.email,
        emailVariables: {
          ukefDealId: mockDeal.ukefDealId,
          bankInternalRefName: String(mockDeal.bankInternalRefName),
          exporterName: mockDeal.exporter.companyName,
          ukefFacilityId: mockFacilityDetails.ukefFacilityId,
          dateEffectiveFrom: '-',
          newCoverEndDate: '-',
          newFacilityEndDate: '-',
          newFacilityValue: '-',
          makersName: `${mockDeal.maker.firstname} ${mockDeal.maker.surname}`,
          checkersName: `${mockUser.firstname} ${mockUser.surname}`,
          checkersEmail: mockUser.email,
        },
      });
    });
  });

  describe('when the comment is too long', () => {
    const longComment = 'a'.repeat(RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT + 1);

    it('should render the return amendment to maker template with errors', async () => {
      // Arrange
      const { req, res } = getHttpMocks(longComment);

      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT} characters`,
      });

      // Act
      await postReturnAmendmentToMaker(req, res);

      const expectedViewModel = {
        exporterName: mockDeal.exporter.companyName,
        dealId,
        facilityId,
        amendmentId,
        facilityType: MOCK_ISSUED_FACILITY.details.type,
        previousPage: `/gef/application-details/${mockDeal._id}/${PORTAL_AMENDMENT_PAGES.AMENDMENT_DETAILS}`,
        maxCommentLength: RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT,
        comment: longComment,
        errors,
        isReturningAmendmentToMaker: true,
      };

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getRenderView()).toEqual('partials/return-to-maker.njk');
      expect(res._getRenderData()).toEqual(expectedViewModel);
    });

    it('should call getAmendment, getFacility and getApplication with the correct variables only once', async () => {
      // Arrange
      const { req, res } = getHttpMocks(longComment);

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(getAmendmentMock).toHaveBeenCalledTimes(1);
      expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });

      expect(getApplicationMock).toHaveBeenCalledTimes(1);
      expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });

      expect(getFacilityMock).toHaveBeenCalledTimes(1);
      expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
    });

    it('should NOT call getUserDetails, updateAmendmentStatus', async () => {
      // Arrange
      const { req, res } = getHttpMocks(longComment);

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(getUserDetailsMock).toHaveBeenCalledTimes(0);

      expect(updateApplicationMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('when the deal is not found', () => {
    beforeEach(() => {
      getApplicationMock.mockResolvedValue(undefined);
    });

    it('should redirect to /not-found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/not-found`);
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

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
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/not-found`);
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

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
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/not-found`);
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

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
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/not-found`);
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

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
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error posting facility amendment return to maker %o', mockError);
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
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error posting facility amendment return to maker %o', mockError);
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
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    });

    it('should call console.error with the error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postReturnAmendmentToMaker(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error posting facility amendment return to maker %o', mockError);
    });
  });
});

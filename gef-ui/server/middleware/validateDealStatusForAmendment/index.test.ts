import { PORTAL_LOGIN_STATUS, aPortalSessionUser, DEAL_STATUS, DEAL_SUBMISSION_TYPE, ROLES } from '@ukef/dtfs2-common';
import { createMocks } from 'node-mocks-http';
import { Request, NextFunction } from 'express';

import { validateDealStatusForAmendment } from '.';
import * as api from '../../services/api';
import { MOCK_BASIC_DEAL } from '../../utils/mocks/mock-applications';
import { Deal } from '../../types/deal';

jest.mock('../../services/api');

const mockGetApplication = jest.fn();

const dealId = '123';
const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;

const mockUser = ROLES.MAKER;

const getHttpMocks = (user: string) =>
  createMocks<Request>({
    params: { dealId },
    session: {
      user: { ...aPortalSessionUser(), roles: [user] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

describe('validateDealStatusForAmendment', () => {
  let next: NextFunction;
  jest.spyOn(console, 'error');

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('when the deal status is acceptable', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);

      next = jest.fn();
    });

    it(`should call next when status is ${DEAL_STATUS.UKEF_ACKNOWLEDGED}`, async () => {
      // Arrange
      mockGetApplication.mockResolvedValue(mockDeal);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('when the deal status is NOT acceptable', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);
    });

    it(`should NOT call next and should call redirect when status is ${DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS}`, async () => {
      // Arrange
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
      };
      // Arrange
      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it(`should NOT call next and should call redirect when status is ${DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS}`, async () => {
      // Arrange
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
      };

      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it(`should NOT call next and should call redirect when status is ${DEAL_STATUS.SUBMITTED_TO_UKEF}`, async () => {
      // Arrange
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.SUBMITTED_TO_UKEF,
      };
      // Arrange
      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it(`should NOT call next and should call redirect when status is ${DEAL_STATUS.IN_PROGRESS}`, async () => {
      // Arrange
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.IN_PROGRESS,
      };
      // Arrange
      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it(`should NOT call next and should call redirect when status is ${DEAL_STATUS.CANCELLED}`, async () => {
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.CANCELLED,
      };
      // Arrange
      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it(`should call console.error when status is ${DEAL_STATUS.CANCELLED}`, async () => {
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.CANCELLED,
      };
      // Arrange
      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Deal %s does not have the correct status to accept a facility amendment %s', dealId, DEAL_STATUS.CANCELLED);
    });

    it(`should NOT call next and should call redirect when status is ${DEAL_STATUS.ABANDONED}`, async () => {
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.ABANDONED,
      };
      // Arrange
      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it(`should NOT call next and should call redirect when status is ${DEAL_STATUS.WITHDRAWN}`, async () => {
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.WITHDRAWN,
      };
      // Arrange
      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it(`should NOT call next and should call redirect when status is ${DEAL_STATUS.EXPIRED}`, async () => {
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.EXPIRED,
      };
      // Arrange
      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it(`should NOT call next and should call redirect when status is ${DEAL_STATUS.NOT_STARTED}`, async () => {
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.NOT_STARTED,
      };
      // Arrange
      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it(`should NOT call next and should call redirect when status is ${DEAL_STATUS.DRAFT}`, async () => {
      const application = {
        ...mockDeal,
        status: DEAL_STATUS.DRAFT,
      };
      // Arrange
      mockGetApplication.mockResolvedValue(application);

      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });
  });

  describe('when the deal is not found', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      mockGetApplication.mockResolvedValue(null);
    });

    it('should call redirect to not-found page', async () => {
      // Arrange
      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });

    it('should call console.error', async () => {
      // Arrange
      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Deal %s was not found', dealId);
    });
  });

  describe('when the getApplication errors', () => {
    const mockError = new Error('Error getting application');

    beforeEach(() => {
      jest.resetAllMocks();

      jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);

      mockGetApplication.mockRejectedValue(mockError);

      next = jest.fn();
    });

    it('should call redirect to problem-with-service page', async () => {
      // Arrange
      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
      expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    });

    it('should call console.error', async () => {
      // Arrange
      const { req, res } = getHttpMocks(mockUser);

      // Act
      await validateDealStatusForAmendment(req, res, next);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error validating amendment deal status %o', mockError);
    });
  });
});

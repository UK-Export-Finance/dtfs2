import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import {
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  PORTAL_LOGIN_STATUS,
  ROLES,
  PortalFacilityAmendmentWithUkefId,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
} from '@ukef/dtfs2-common';

import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { getApplicationAmendments, GetApplicationAmendmentsRequest } from './get-application-amendments';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { getSubmittedAmendmentDetails } from '../../../utils/submitted-amendment-details';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';

import { Deal } from '../../../types/deal';
import api from '../../../services/api';

jest.mock('../../../services/api', () => ({
  getApplication: jest.fn(),
  getUserDetails: jest.fn(),
  getAmendmentsOnDeal: jest.fn(),
}));

jest.mock('../../../utils/submitted-amendment-details', () => ({
  getSubmittedAmendmentDetails: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

const mockGetApplication = jest.fn();
const mockGetAmendments = jest.fn();
const mockUserResponse = jest.fn();
console.error = jest.fn();

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const getHttpMocks = (user: string) =>
  createMocks<GetApplicationAmendmentsRequest>({
    params: { dealId },
    session: {
      user: { ...aPortalSessionUser(), roles: [user] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;
const users = [ROLES.MAKER, ROLES.CHECKER];
const mockUser = aPortalSessionUser();
const isPortalAmendmentsFeatureFlagEnabledMock = true;

describe('getAmendmentDetails', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;
  jest.spyOn(console, 'error');

  beforeEach(() => {
    jest.resetAllMocks();

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build();
    const mockGetSubmittedDetailsResponse = {
      portalAmendmentStatus: null,
      facilityIdWithAmendmentInProgress: null,
      isPortalAmendmentInProgress: false,
    };

    jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);
    jest.spyOn(api, 'getUserDetails').mockImplementation(mockUserResponse);
    jest.spyOn(api, 'getAmendmentsOnDeal').mockImplementation(mockGetAmendments);

    (getSubmittedAmendmentDetails as jest.Mock).mockResolvedValue(mockGetSubmittedDetailsResponse);
    mockUserResponse.mockResolvedValue(mockUser);
    mockGetApplication.mockResolvedValue(mockDeal);
    mockGetAmendments.mockResolvedValue([amendment]);

    mockIsPortalFacilityAmendmentsFeatureFlagEnabled(isPortalAmendmentsFeatureFlagEnabledMock);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  users.forEach((user) => {
    describe(`when the user is a ${user}`, () => {
      describe('when an application is not found', () => {
        it('should redirect to /not-found', async () => {
          // Arrange
          mockGetApplication.mockResolvedValue(null);
          const { req, res } = getHttpMocks(user);

          // Act
          await getApplicationAmendments(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
          expect(res._getRedirectUrl()).toEqual('/not-found');
        });

        it('should log a console error', async () => {
          // Arrange
          mockGetApplication.mockResolvedValue(null);
          const { req, res } = getHttpMocks(user);

          // Act
          await getApplicationAmendments(req, res);

          // Assert
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith('Deal %s was not found', dealId);
        });
      });

      describe('when portal amendments are not found', () => {
        it('should redirect to /not-found', async () => {
          // Arrange
          mockGetAmendments.mockResolvedValue(null);
          const { req, res } = getHttpMocks(user);

          // Act
          await getApplicationAmendments(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
          expect(res._getRedirectUrl()).toEqual('/not-found');
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith('Application amendments were not found for the deal %s', dealId);
        });
      });

      describe('when getAmendmentsOnDeal fails', () => {
        it('should redirect to problem-with service', async () => {
          // Arrange
          mockGetAmendments.mockRejectedValue({});
          const { req, res } = getHttpMocks(user);

          // Act
          await getApplicationAmendments(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
          expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith('Error getting application amendments page %o', {});
        });
      });
    });
  });

  function mockIsPortalFacilityAmendmentsFeatureFlagEnabled(value: boolean) {
    jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(value);
  }
});

import { aPortalSessionUser, DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_LOGIN_STATUS, ROLES, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { getAmendmentDetails, GetAmendmentDetailsRequest } from './get-amendment-details';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { createAmendmentDetailsViewModel } from './create-amendment-details-view-model.ts';
import { Deal } from '../../../types/deal';
import api from '../../../services/api';

jest.mock('../../../services/api', () => ({
  getApplication: jest.fn(),
  getFacility: jest.fn(),
  getAmendment: jest.fn(),
  getPortalAmendmentsOnDeal: jest.fn(),
}));

const mockGetFacility = jest.fn();
const mockGetApplication = jest.fn();
const mockGetAmendment = jest.fn();
console.error = jest.fn();

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const getHttpMocks = (user: string) =>
  createMocks<GetAmendmentDetailsRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [user] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED } as unknown as Deal;
const users = [ROLES.MAKER, ROLES.CHECKER];

describe('getAmendmentDetails', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;
  jest.spyOn(console, 'error');

  beforeEach(() => {
    jest.resetAllMocks();

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder().withDealId(dealId).withFacilityId(facilityId).withAmendmentId(amendmentId).build();

    jest.spyOn(api, 'getFacility').mockImplementation(mockGetFacility);
    jest.spyOn(api, 'getApplication').mockImplementation(mockGetApplication);
    jest.spyOn(api, 'getAmendment').mockImplementation(mockGetAmendment);

    mockGetApplication.mockResolvedValue(mockDeal);
    mockGetFacility.mockResolvedValue(MOCK_ISSUED_FACILITY);
    mockGetAmendment.mockResolvedValue(amendment);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  users.forEach((user) => {
    describe(`when the user is a ${user} and facilityId, amendmentId don't exist`, () => {
      describe('when a deal, facility and amendment are found', () => {
        it('should render the template with the correct variables', async () => {
          // Arrange
          const userRoles = [user];
          const facility = MOCK_ISSUED_FACILITY.details;
          const { req, res } = getHttpMocks(user);

          // Act
          await getAmendmentDetails(req, res);

          // Assert
          const expectedRenderData = createAmendmentDetailsViewModel({ amendment, deal: mockDeal, facility, userRoles });

          expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
          expect(res._getRenderView()).toEqual('partials/amendments/amendment-details.njk');
          expect(res._getRenderData()).toEqual(expectedRenderData);
          expect(console.error).toHaveBeenCalledTimes(0);
        });
      });

      describe('when an application is not found', () => {
        it('should redirect to /not-found', async () => {
          // Arrange
          mockGetApplication.mockResolvedValue(null);
          const { req, res } = getHttpMocks(user);

          // Act
          await getAmendmentDetails(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
          expect(res._getRedirectUrl()).toEqual('/not-found');
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith('Deal %s was not found', dealId);
        });
      });

      describe('when a facility is not found', () => {
        it('should redirect to /not-found', async () => {
          // Arrange
          mockGetFacility.mockResolvedValue({});
          const { req, res } = getHttpMocks(user);

          // Act
          await getAmendmentDetails(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
          expect(res._getRedirectUrl()).toEqual('/not-found');
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith('Facility %s was not found', facilityId);
        });
      });

      describe('when an amendment is not found', () => {
        it('should redirect to /not-found', async () => {
          mockGetAmendment.mockResolvedValue(null);

          // Arrange
          const { req, res } = getHttpMocks(user);

          // Act
          await getAmendmentDetails(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
          expect(res._getRedirectUrl()).toEqual('/not-found');
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith('Amendment was not found for the provided amendment id %s and facility id %s', amendmentId, facilityId);
        });
      });

      describe('when getApplication fails', () => {
        it('should redirect to problem-with service', async () => {
          // Arrange
          mockGetApplication.mockRejectedValue({});
          const { req, res } = getHttpMocks(user);

          // Act
          await getAmendmentDetails(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
          expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith('Error getting amendments details page %o', {});
        });
      });

      describe('when getFacility fails', () => {
        it('should redirect to problem-with service', async () => {
          // Arrange
          mockGetFacility.mockRejectedValue({});
          const { req, res } = getHttpMocks(user);

          // Act
          await getAmendmentDetails(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
          expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith('Error getting amendments details page %o', {});
        });
      });

      describe('when getPortalAmendmentsOnDeal fails', () => {
        it('should redirect to problem-with service', async () => {
          // Arrange
          mockGetAmendment.mockRejectedValue({});
          const { req, res } = getHttpMocks(user);

          // Act
          await getAmendmentDetails(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
          expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith('Error getting amendments details page %o', {});
        });
      });
    });

    describe(`when the user is a ${user} and facilityId, amendmentId exist`, () => {
      describe('when a deal, facility and amendment are found', () => {
        it('should render the template with the correct variables', async () => {
          // Arrange
          const userRoles = [user];
          const facility = MOCK_ISSUED_FACILITY.details;
          const { req, res } = getHttpMocks(user);
          req.query.facilityId = facilityId;
          req.query.amendmentId = amendmentId;

          // Act
          await getAmendmentDetails(req, res);

          // Assert
          const expectedRenderData = createAmendmentDetailsViewModel({ amendment, deal: mockDeal, facility, userRoles });

          expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
          expect(res._getRenderView()).toEqual('partials/amendments/amendment-details.njk');
          expect(res._getRenderData()).toEqual(expectedRenderData);
          expect(console.error).toHaveBeenCalledTimes(0);
        });
      });

      describe('when an amendment is not found', () => {
        it('should redirect to /not-found', async () => {
          // Arrange
          mockGetAmendment.mockResolvedValue(null);
          const { req, res } = getHttpMocks(user);
          req.query.facilityId = facilityId;
          req.query.amendmentId = amendmentId;

          // Act
          await getAmendmentDetails(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
          expect(res._getRedirectUrl()).toEqual('/not-found');
          expect(console.error).toHaveBeenCalledTimes(1);
          expect(console.error).toHaveBeenCalledWith('Amendment was not found for the provided amendment id %s and facility id %s', amendmentId, facilityId);
        });
      });
    });
  });
});

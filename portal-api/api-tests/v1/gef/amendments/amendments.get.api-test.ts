import { ObjectId } from 'mongodb';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, AnyObject, PortalFacilityAmendmentWithUkefId, Role } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import app from '../../../../src/createApp';
import testUserCache from '../../../api-test-users';

import { CHECKER, MAKER } from '../../../../src/v1/roles/roles';
import { getAmendmentUrl } from './amendment-urls';
import createApi from '../../../api';
import { TestUser } from '../../../types/test-user';
import { withRoleAuthorisationTests } from '../../../common-tests/role-authorisation-tests';
import { withClientAuthenticationTests } from '../../../common-tests/client-authentication-tests';

const { as, get } = createApi(app);

const getPortalFacilityAmendmentMock = jest.fn() as jest.Mock<Promise<PortalFacilityAmendmentWithUkefId>>;

jest.mock('../../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../../src/v1/api'),
  getPortalFacilityAmendment: () => getPortalFacilityAmendmentMock(),
}));

const originalProcessEnv = { ...process.env };

const validFacilityId = new ObjectId().toString();
const validAmendmentId = new ObjectId().toString();

const invalidId = 'invalid-id';

describe('/v1/gef/facilities/:facilityId/amendments/:amendmentId', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let maker1: TestUser;

  describe('GET /v1/gef/facilities/:facilityId/amendments/:amendmentId', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    beforeAll(async () => {
      testUsers = await testUserCache.initialise(app);
      maker1 = testUsers().withRole(MAKER).one() as TestUser;
    });

    afterAll(() => {
      jest.resetAllMocks();
      process.env = originalProcessEnv;
    });

    describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is disabled', () => {
      beforeEach(() => {
        process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'false';
      });

      it(`should return a ${HttpStatusCode.NotFound} response`, async () => {
        // Arrange
        const url = getAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(maker1).get(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NotFound);
      });
    });

    describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled', () => {
      beforeEach(() => {
        process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      withClientAuthenticationTests({
        makeRequestWithoutAuthHeader: () => get(getAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId })),
        makeRequestWithAuthHeader: (authHeader: string) =>
          get(getAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId }), { headers: { Authorization: authHeader } }),
      });

      withRoleAuthorisationTests({
        allowedRoles: [MAKER, CHECKER],
        getUserWithRole: (role: Role) => testUsers().withRole(role).one() as TestUser,
        makeRequestAsUser: (user: TestUser) => as(user).get(getAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId })),
        successStatusCode: HttpStatusCode.Ok,
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the facility id path param is invalid`, async () => {
        // Arrange
        const url = getAmendmentUrl({ facilityId: invalidId, amendmentId: validAmendmentId });

        // Act
        const response = await as(maker1).get(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a  ${HttpStatusCode.BadRequest} response when the amendment id path param is invalid`, async () => {
        // Arrange
        const url = getAmendmentUrl({ facilityId: validFacilityId, amendmentId: invalidId });

        // Act
        const response = await as(maker1).get(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a ${HttpStatusCode.Ok} response and the amendment for an authenticated user`, async () => {
        const amendmentId = new ObjectId().toString();
        const facilityId = new ObjectId().toString();
        const dealId = new ObjectId().toString();

        // Arrange
        const amendment: PortalFacilityAmendmentWithUkefId = {
          amendmentId,
          facilityId,
          dealId,
          type: AMENDMENT_TYPES.PORTAL,
          ukefFacilityId: '123',
          createdAt: 1702061978881,
          updatedAt: 1702061978881,
          status: PORTAL_AMENDMENT_STATUS.DRAFT,
          eligibilityCriteria: { version: 1, criteria: [] },
          createdBy: {
            username: maker1.username,
            name: maker1.firstname,
            email: maker1.email,
          },
        };

        jest.mocked(getPortalFacilityAmendmentMock).mockResolvedValue(amendment);
        const url = getAmendmentUrl({ facilityId, amendmentId });

        // Act
        const response = await as(maker1).get(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        expect(response.body).toEqual({ ...amendment, amendmentId, facilityId, dealId });
      });
    });
  });
});

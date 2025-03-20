import { ObjectId } from 'mongodb';
import {
  PORTAL_AMENDMENT_STATUS,
  AMENDMENT_TYPES,
  AnyObject,
  PortalFacilityAmendmentWithUkefId,
  Role,
  PORTAL_AMENDMENT_UNDERWAY_STATUSES,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import app from '../../../../src/createApp';
import testUserCache from '../../../api-test-users';

import { MAKER, CHECKER } from '../../../../src/v1/roles/roles';
import { getAllAmendmentsUrl } from './amendment-urls';
import createApi from '../../../api';
import { TestUser } from '../../../types/test-user';
import { withRoleAuthorisationTests } from '../../../common-tests/role-authorisation-tests';
import { withClientAuthenticationTests } from '../../../common-tests/client-authentication-tests';

const { as, get } = createApi(app);

const getAllPortalFacilityAmendmentsMock = jest.fn() as jest.Mock<Promise<PortalFacilityAmendmentWithUkefId[]>>;

jest.mock('../../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../../src/v1/api'),
  getAllPortalFacilityAmendments: () => getAllPortalFacilityAmendmentsMock(),
}));

const originalProcessEnv = { ...process.env };
const statuses = PORTAL_AMENDMENT_UNDERWAY_STATUSES;

describe('/v1/gef/facilities/amendments', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let aMaker: TestUser;

  describe('GET /v1/gef/facilities/amendments', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    beforeAll(async () => {
      testUsers = await testUserCache.initialise(app);
      aMaker = testUsers().withRole(MAKER).one() as TestUser;
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
        const url = getAllAmendmentsUrl({ statuses });

        // Act
        const response = await as(aMaker).get(url);

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
        makeRequestWithoutAuthHeader: () => get(getAllAmendmentsUrl({})),
        makeRequestWithAuthHeader: (authHeader: string) => get(getAllAmendmentsUrl({}), { headers: { Authorization: authHeader } }),
      });

      withRoleAuthorisationTests({
        allowedRoles: [MAKER, CHECKER],
        getUserWithRole: (role: Role) => testUsers().withRole(role).one() as TestUser,
        makeRequestAsUser: (user: TestUser) => as(user).get(getAllAmendmentsUrl({})),
        successStatusCode: HttpStatusCode.Ok,
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
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
          status: PORTAL_AMENDMENT_STATUS.DRAFT,
          eligibilityCriteria: { version: 1, criteria: [] },
          createdBy: {
            username: aMaker.username,
            name: aMaker.firstname,
            email: aMaker.email,
          },
        };

        jest.mocked(getAllPortalFacilityAmendmentsMock).mockResolvedValue([amendment]);
        const url = getAllAmendmentsUrl({});

        // Act
        const response = await as(aMaker).get(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        expect(response.body).toEqual([{ ...amendment, amendmentId, facilityId, dealId }]);
      });
    });
  });
});

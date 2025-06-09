import { ObjectId } from 'mongodb';
import {
  PORTAL_AMENDMENT_STATUS,
  AMENDMENT_TYPES,
  AnyObject,
  Role,
  PORTAL_AMENDMENT_INPROGRESS_STATUSES,
  FacilityAllTypeAmendmentWithUkefId,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import app from '../../../../src/createApp';
import testUserCache from '../../../api-test-users';

import ROLES, { MAKER } from '../../../../src/v1/roles/roles';
import { getAmendmentsOnDealUrl } from './amendment-urls';
import createApi from '../../../api';
import { TestUser } from '../../../types/test-user';
import { withRoleAuthorisationTests } from '../../../common-tests/role-authorisation-tests';
import { withClientAuthenticationTests } from '../../../common-tests/client-authentication-tests';

const { as, get } = createApi(app);

const getFacilityAmendmentsOnDealMock = jest.fn() as jest.Mock<Promise<FacilityAllTypeAmendmentWithUkefId[]>>;

jest.mock('../../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../../src/v1/api'),
  getFacilityAmendmentsOnDeal: () => getFacilityAmendmentsOnDealMock(),
}));

const validDealId = new ObjectId().toString();
const statuses = PORTAL_AMENDMENT_INPROGRESS_STATUSES;

const invalidId = 'invalid-id';

describe('/v1/gef/deals/:dealId/all-types-amendments', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let maker1: TestUser;

  describe('GET /v1/gef/deals/:dealId/all-types-amendments', () => {
    beforeAll(async () => {
      testUsers = await testUserCache.initialise(app);
      maker1 = testUsers().withRole(MAKER).one() as TestUser;
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(getAmendmentsOnDealUrl({ dealId: validDealId })),
      makeRequestWithAuthHeader: (authHeader: string) =>
        get(getAmendmentsOnDealUrl({ dealId: validDealId, statuses }), { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: Object.values(ROLES),
      getUserWithRole: (role: Role) => testUsers().withRole(role).one() as TestUser,
      makeRequestAsUser: (user: TestUser) => as(user).get(getAmendmentsOnDealUrl({ dealId: validDealId, statuses })),
      successStatusCode: HttpStatusCode.Ok,
    });

    it(`should return a ${HttpStatusCode.BadRequest} response when deal id path param is invalid`, async () => {
      // Arrange
      const url = getAmendmentsOnDealUrl({ dealId: invalidId, statuses });

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
      const amendment = {
        amendmentId,
        facilityId,
        dealId,
        type: AMENDMENT_TYPES.PORTAL,
        ukefFacilityId: '123',
        createdAt: 1702061978881,
        updatedAt: 1702061978881,
        status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
        eligibilityCriteria: { version: 1, criteria: [] },
        createdBy: {
          username: maker1.username,
          name: maker1.firstname,
          email: maker1.email,
        },
      } as FacilityAllTypeAmendmentWithUkefId;

      jest.mocked(getFacilityAmendmentsOnDealMock).mockResolvedValue([amendment]);
      const url = getAmendmentsOnDealUrl({ dealId, statuses });

      // Act
      const response = await as(maker1).get(url);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.body).toEqual([amendment]);
    });
  });
});

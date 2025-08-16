import { ObjectId } from 'mongodb';
import { AnyObject, Role, MOCK_TFM_FACILITY } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import app from '../../../src/createApp';
import testUserCache from '../../api-test-users';

import { CHECKER, MAKER } from '../../../src/v1/roles/roles';
import createApi from '../../api';
import { TestUser } from '../../types/test-user';
import { withRoleAuthorisationTests } from '../../common-tests/role-authorisation-tests';
import { withClientAuthenticationTests } from '../../common-tests/client-authentication-tests';

const { as, get } = createApi(app);

const getTfmFacilityMock = jest.fn() as jest.Mock<Promise<AnyObject>>;

jest.mock('../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../src/v1/api'),
  getTfmFacility: () => getTfmFacilityMock(),
}));

const originalProcessEnv = { ...process.env };

const validFacilityId = new ObjectId().toString();

const invalidId = 'invalid-id';

const url = (facilityId: string) => `/v1/tfm/facility/${facilityId}`;

const mockFacility = {
  ...MOCK_TFM_FACILITY,
  id: new ObjectId(),
};

describe('/v1/tfm/facility/:facilityId', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let maker1: TestUser;

  describe('GET /v1/gef/facilities/:facilityId/amendments/:amendmentId', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      getTfmFacilityMock.mockResolvedValue({ data: mockFacility });
    });

    beforeAll(async () => {
      testUsers = await testUserCache.initialise(app);
      maker1 = testUsers().withRole(MAKER).one() as TestUser;
    });

    afterAll(() => {
      jest.resetAllMocks();
      process.env = originalProcessEnv;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(url(validFacilityId)),
      makeRequestWithAuthHeader: (authHeader: string) => get(url(validFacilityId), { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER],
      getUserWithRole: (role: Role) => testUsers().withRole(role).one() as TestUser,
      makeRequestAsUser: (user: TestUser) => as(user).get(url(validFacilityId)),
      successStatusCode: HttpStatusCode.Ok,
    });

    it(`should return a ${HttpStatusCode.BadRequest} response when the facility id path param is invalid`, async () => {
      // Arrange
      const getUrl = url(invalidId);

      // Act
      const response = await as(maker1).get(getUrl);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.BadRequest);
    });

    it(`should return a ${HttpStatusCode.Ok} response and the amendment for an authenticated user`, async () => {
      const getUrl = url(validFacilityId);

      // Act
      const response = await as(maker1).get(getUrl);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
    });
  });
});

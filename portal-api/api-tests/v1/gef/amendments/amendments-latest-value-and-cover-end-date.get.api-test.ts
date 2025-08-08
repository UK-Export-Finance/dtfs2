import { ObjectId } from 'mongodb';
import { AnyObject, LatestAmendmentValueAndCoverEndDate, Role } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import app from '../../../../src/createApp';
import testUserCache from '../../../api-test-users';

import { MAKER } from '../../../../src/v1/roles/roles';
import { getLatestAmendmentValueAndCoverEndDateUrl } from './amendment-urls';
import createApi from '../../../api';
import { TestUser } from '../../../types/test-user';
import { withRoleAuthorisationTests } from '../../../common-tests/role-authorisation-tests';
import { withClientAuthenticationTests } from '../../../common-tests/client-authentication-tests';

const { as, get } = createApi(app);

const getLatestAmendmentFacilityValueAndCoverEndDateMock = jest.fn() as jest.Mock<Promise<LatestAmendmentValueAndCoverEndDate>>;

jest.mock('../../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../../src/v1/api'),
  getLatestAmendmentFacilityValueAndCoverEndDate: () => getLatestAmendmentFacilityValueAndCoverEndDateMock(),
}));

const originalProcessEnv = { ...process.env };

const validFacilityId = new ObjectId().toString();

const invalidId = 'invalid-id';

describe('/v1/gef/facilities/:facilityId/amendments/latest-value-and-cover-end-date', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let maker1: TestUser;

  describe('GET /v1/gef/facilities/:facilityId/amendments/latest-value-and-cover-end-date', () => {
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
        const url = getLatestAmendmentValueAndCoverEndDateUrl(validFacilityId);

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
        makeRequestWithoutAuthHeader: () => get(getLatestAmendmentValueAndCoverEndDateUrl(validFacilityId)),
        makeRequestWithAuthHeader: (authHeader: string) =>
          get(getLatestAmendmentValueAndCoverEndDateUrl(validFacilityId), { headers: { Authorization: authHeader } }),
      });

      withRoleAuthorisationTests({
        allowedRoles: [MAKER],
        getUserWithRole: (role: Role) => testUsers().withRole(role).one() as TestUser,
        makeRequestAsUser: (user: TestUser) => as(user).get(getLatestAmendmentValueAndCoverEndDateUrl(validFacilityId)),
        successStatusCode: HttpStatusCode.Ok,
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the facility id path param is invalid`, async () => {
        // Arrange
        const url = getLatestAmendmentValueAndCoverEndDateUrl(invalidId);

        // Act
        const response = await as(maker1).get(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a ${HttpStatusCode.Ok} response and the amendment for an authenticated user`, async () => {
        const latest = {
          value: '100000',
          coverEndDate: '167368000000',
        };

        jest.mocked(getLatestAmendmentFacilityValueAndCoverEndDateMock).mockResolvedValue(latest);
        const url = getLatestAmendmentValueAndCoverEndDateUrl(validFacilityId);

        // Act
        const response = await as(maker1).get(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        expect(response.body).toEqual(latest);
      });
    });
  });
});

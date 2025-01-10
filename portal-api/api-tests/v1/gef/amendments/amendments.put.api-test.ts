import { ObjectId } from 'mongodb';
import { AMENDMENT_STATUS, AMENDMENT_TYPES, AnyObject, PortalFacilityAmendmentUserValues, PortalFacilityAmendmentWithUkefId, Role } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import app from '../../../../src/createApp';
import testUserCache from '../../../api-test-users';

import { MAKER } from '../../../../src/v1/roles/roles';
import createApi from '../../../api';
import { TestUser } from '../../../types/test-user';
import { withRoleAuthorisationTests } from '../../../common-tests/role-authorisation-tests';
import { withClientAuthenticationTests } from '../../../common-tests/client-authentication-tests';
import { putAmendmentUrl } from './amendment-urls';

const { as, put } = createApi(app);

const putPortalFacilityAmendmentMock = jest.fn() as jest.Mock<Promise<PortalFacilityAmendmentWithUkefId>>;

jest.mock('../../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../../src/v1/api'),
  putPortalFacilityAmendment: () => putPortalFacilityAmendmentMock(),
}));

const originalProcessEnv = { ...process.env };

const validFacilityId = new ObjectId().toString();

const invalidId = 'invalid-id';

const dealId = new ObjectId().toString();

const validPayload: { dealId: string; amendment: PortalFacilityAmendmentUserValues } = {
  dealId,
  amendment: {
    changeCoverEndDate: true,
    changeFacilityValue: false,
  },
};

describe('/v1/gef/facilities/:facilityId/amendments', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let aMaker: TestUser;

  describe('PUT /v1/gef/facilities/:facilityId/amendments', () => {
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
        const url = putAmendmentUrl({ facilityId: validFacilityId });

        // Act
        const response = await as(aMaker).put(validPayload).to(url);

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
        makeRequestWithoutAuthHeader: () => put(putAmendmentUrl({ facilityId: validFacilityId })),
        makeRequestWithAuthHeader: (authHeader: string) => put(putAmendmentUrl({ facilityId: validFacilityId }), { headers: { Authorization: authHeader } }),
      });

      withRoleAuthorisationTests({
        allowedRoles: [MAKER],
        getUserWithRole: (role: Role) => testUsers().withRole(role).one() as TestUser,
        makeRequestAsUser: (user: TestUser) =>
          as(user)
            .put(validPayload)
            .to(putAmendmentUrl({ facilityId: validFacilityId })),
        successStatusCode: HttpStatusCode.Ok,
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the facility id path param is invalid`, async () => {
        // Arrange
        const url = putAmendmentUrl({ facilityId: invalidId });

        // Act
        const response = await as(aMaker).put(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the payload is invalid`, async () => {
        // Arrange
        const url = putAmendmentUrl({ facilityId: validFacilityId });

        const invalidPayload = { dealId, amendment: { changeCoverEndDate: 'yes' } };

        // Act
        const response = await as(aMaker).put(invalidPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a ${HttpStatusCode.Ok} response and the amendment for an authenticated user`, async () => {
        const amendmentId = new ObjectId().toString();
        const facilityId = new ObjectId().toString();

        // Arrange
        const amendment: PortalFacilityAmendmentWithUkefId = {
          amendmentId,
          facilityId,
          dealId,
          type: AMENDMENT_TYPES.PORTAL,
          ukefFacilityId: '123',
          createdAt: 1702061978881,
          updatedAt: 1702061978881,
          status: AMENDMENT_STATUS.IN_PROGRESS,
        };

        jest.mocked(putPortalFacilityAmendmentMock).mockResolvedValue(amendment);
        const url = putAmendmentUrl({ facilityId });

        // Act
        const response = await as(aMaker).put(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        expect(response.body).toEqual(amendment);
      });
    });
  });
});

import { ObjectId } from 'mongodb';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, AnyObject, PortalFacilityAmendmentWithUkefId, Role } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import app from '../../../../src/createApp';
import testUserCache from '../../../api-test-users';

import { CHECKER, MAKER } from '../../../../src/v1/roles/roles';
import createApi from '../../../api';
import { TestUser } from '../../../types/test-user';
import { withRoleAuthorisationTests } from '../../../common-tests/role-authorisation-tests';
import { withClientAuthenticationTests } from '../../../common-tests/client-authentication-tests';
import { patchAmendmentStatusUrl } from './amendment-urls';

const { as, patch } = createApi(app);

const patchPortalFacilityAmendmentStatusMock = jest.fn() as jest.Mock<Promise<PortalFacilityAmendmentWithUkefId>>;

jest.mock('../../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../../src/v1/api'),
  patchPortalFacilityAmendmentStatus: () => patchPortalFacilityAmendmentStatusMock(),
}));

const originalProcessEnv = { ...process.env };

const validFacilityId = new ObjectId().toString();

const validAmendmentId = new ObjectId().toString();

const invalidId = 'invalid-id';

const dealId = new ObjectId().toString();

const validPayload = {
  newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
};

describe('/v1/gef/facilities/:facilityId/amendments/:amendmentId', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let aMaker: TestUser;

  describe('PATCH /v1/gef/facilities/:facilityId/amendments/:amendmentId/status', () => {
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
        const url = patchAmendmentStatusUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(aMaker).patch(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NotFound);
      });
    });

    describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is not set', () => {
      beforeEach(() => {
        delete process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED;
      });

      it(`should return a ${HttpStatusCode.NotFound} response`, async () => {
        // Arrange
        const url = patchAmendmentStatusUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(aMaker).patch(validPayload).to(url);

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
        makeRequestWithoutAuthHeader: () => patch(patchAmendmentStatusUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId })),
        makeRequestWithAuthHeader: (authHeader: string) =>
          patch(patchAmendmentStatusUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId }), { headers: { Authorization: authHeader } }),
      });

      withRoleAuthorisationTests({
        allowedRoles: [MAKER, CHECKER],
        getUserWithRole: (role: Role) => testUsers().withRole(role).one() as TestUser,
        makeRequestAsUser: (user: TestUser) =>
          as(user)
            .patch(validPayload)
            .to(patchAmendmentStatusUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId })),
        successStatusCode: HttpStatusCode.Ok,
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the facility id path param is invalid`, async () => {
        // Arrange
        const url = patchAmendmentStatusUrl({ facilityId: invalidId, amendmentId: validAmendmentId });

        // Act
        const response = await as(aMaker).patch(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the payload is invalid`, async () => {
        // Arrange
        const url = patchAmendmentStatusUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        const invalidPayload = { newStatus: PORTAL_AMENDMENT_STATUS.DRAFT };

        // Act
        const response = await as(aMaker).patch(invalidPayload).to(url);

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
          status: PORTAL_AMENDMENT_STATUS.DRAFT,
          eligibilityCriteria: { version: 1, criteria: [] },
          createdBy: {
            username: aMaker.username,
            name: aMaker.firstname,
            email: aMaker.email,
          },
        };

        jest.mocked(patchPortalFacilityAmendmentStatusMock).mockResolvedValue(amendment);
        const url = patchAmendmentStatusUrl({ facilityId, amendmentId });

        // Act
        const response = await as(aMaker).patch(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        expect(response.body).toEqual(amendment);
      });
    });
  });
});

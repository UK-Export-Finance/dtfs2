import { ObjectId } from 'mongodb';
import {
  PORTAL_AMENDMENT_STATUS,
  AMENDMENT_TYPES,
  AnyObject,
  PortalFacilityAmendmentUserValues,
  PortalFacilityAmendmentWithUkefId,
  Role,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import app from '../../../../src/createApp';
import testUserCache from '../../../api-test-users';

import { MAKER } from '../../../../src/v1/roles/roles';
import createApi from '../../../api';
import { TestUser } from '../../../types/test-user';
import { withRoleAuthorisationTests } from '../../../common-tests/role-authorisation-tests';
import { withClientAuthenticationTests } from '../../../common-tests/client-authentication-tests';
import { patchAmendmentUrl } from './amendment-urls';

const { as, patch } = createApi(app);

const patchPortalFacilityAmendmentMock = jest.fn() as jest.Mock<Promise<PortalFacilityAmendmentWithUkefId>>;

jest.mock('../../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../../src/v1/api'),
  patchPortalFacilityAmendment: () => patchPortalFacilityAmendmentMock(),
}));

const originalProcessEnv = { ...process.env };

const validFacilityId = new ObjectId().toString();

const validAmendmentId = new ObjectId().toString();

const invalidId = 'invalid-id';

const dealId = new ObjectId().toString();

const validPayload: { update: PortalFacilityAmendmentUserValues } = {
  update: {
    changeCoverEndDate: true,
    changeFacilityValue: false,
  },
};

describe('/v1/gef/facilities/:facilityId/amendments/:amendmentId', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let maker1: TestUser;

  describe('PATCH /v1/gef/facilities/:facilityId/amendments/:amendmentId', () => {
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
        const url = patchAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(maker1).patch(validPayload).to(url);

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
        const url = patchAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(maker1).patch(validPayload).to(url);

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
        makeRequestWithoutAuthHeader: () => patch(patchAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId })),
        makeRequestWithAuthHeader: (authHeader: string) =>
          patch(patchAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId }), { headers: { Authorization: authHeader } }),
      });

      withRoleAuthorisationTests({
        allowedRoles: [MAKER],
        getUserWithRole: (role: Role) => testUsers().withRole(role).one() as TestUser,
        makeRequestAsUser: (user: TestUser) =>
          as(user)
            .patch(validPayload)
            .to(patchAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId })),
        successStatusCode: HttpStatusCode.Ok,
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the facility id path param is invalid`, async () => {
        // Arrange
        const url = patchAmendmentUrl({ facilityId: invalidId, amendmentId: validAmendmentId });

        // Act
        const response = await as(maker1).patch(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the payload is invalid`, async () => {
        // Arrange
        const url = patchAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        const invalidPayload = { update: { changeCoverEndDate: 'yes' } };

        // Act
        const response = await as(maker1).patch(invalidPayload).to(url);

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
            username: maker1.username,
            name: maker1.firstname,
            email: maker1.email,
          },
        };

        jest.mocked(patchPortalFacilityAmendmentMock).mockResolvedValue(amendment);
        const url = patchAmendmentUrl({ facilityId, amendmentId });

        // Act
        const response = await as(maker1).patch(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        expect(response.body).toEqual(amendment);
      });
    });
  });
});

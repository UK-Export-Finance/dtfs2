import { ObjectId } from 'mongodb';
import { Role, AnyObject, portalAmendmentDeleteEmailVariables } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import app from '../../../../src/createApp';
import testUserCache from '../../../api-test-users';

import { MAKER } from '../../../../src/v1/roles/roles';
import createApi from '../../../api';
import { TestUser } from '../../../types/test-user';
import { withRoleAuthorisationTests } from '../../../common-tests/role-authorisation-tests';
import { withClientAuthenticationTests } from '../../../common-tests/client-authentication-tests';
import { deleteAmendmentUrl } from './amendment-urls';

const { as, remove } = createApi(app);

const deletePortalFacilityAmendmentMock = jest.fn() as jest.Mock<Promise<void>>;

jest.mock('../../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../../src/v1/api'),
  deletePortalFacilityAmendment: () => deletePortalFacilityAmendmentMock(),
}));
console.error = jest.fn();

const originalProcessEnv = { ...process.env };

const validFacilityId = new ObjectId().toString();

const validAmendmentId = new ObjectId().toString();

const invalidId = 'invalid-id';

const validPayload = {
  ...portalAmendmentDeleteEmailVariables(),
};

describe('/v1/gef/facilities/:facilityId/amendments/:amendmentId', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let maker1: TestUser;

  describe('DELETE /v1/gef/facilities/:facilityId/amendments/:amendmentId', () => {
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
        const url = deleteAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(maker1).removeTo(validPayload).to(url);

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
        const url = deleteAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(maker1).removeTo(validPayload).to(url);

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
        makeRequestWithoutAuthHeader: () => remove(deleteAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId })),
        makeRequestWithAuthHeader: (authHeader: string) =>
          remove(deleteAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId }), { headers: { Authorization: authHeader } }),
      });

      withRoleAuthorisationTests({
        allowedRoles: [MAKER],
        getUserWithRole: (role: Role) => testUsers().withRole(role).one() as TestUser,
        makeRequestAsUser: (user: TestUser) =>
          as(user)
            .removeTo(validPayload)
            .to(deleteAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId })),
        successStatusCode: HttpStatusCode.Ok,
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the facility id path param is invalid`, async () => {
        // Arrange
        const url = deleteAmendmentUrl({ facilityId: invalidId, amendmentId: validAmendmentId });

        // Act
        const response = await as(maker1).removeTo(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the amendment id path param is invalid`, async () => {
        // Arrange
        const url = deleteAmendmentUrl({ facilityId: validFacilityId, amendmentId: invalidId });

        // Act
        const response = await as(maker1).removeTo(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a ${HttpStatusCode.Ok} response if the api request is successful`, async () => {
        // Arrange
        const url = deleteAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(maker1).removeTo(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
      });
    });
  });
});

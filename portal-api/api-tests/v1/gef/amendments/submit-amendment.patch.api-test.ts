import { portalAmendmentToUkefEmailVariables } from "@ukef/dtfs2-common/test-helpers";
import { ObjectId } from 'mongodb';
import {
  PORTAL_AMENDMENT_STATUS,
  AMENDMENT_TYPES,
  AnyObject,
  PortalFacilityAmendmentWithUkefId,
  Role
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import app from '../../../../server/createApp';
import testUserCache from '../../../api-test-users';

import { CHECKER } from '../../../../server/v1/roles/roles';
import createApi from '../../../api';
import { TestUser } from '../../../types/test-user';
import { withRoleAuthorisationTests } from '../../../common-tests/role-authorisation-tests';
import { withClientAuthenticationTests } from '../../../common-tests/client-authentication-tests';
import { patchSubmitAmendmentUrl } from './amendment-urls';

const { as, patch } = createApi(app);

const patchPortalFacilitySubmitAmendmentMock = jest.fn() as jest.Mock<Promise<PortalFacilityAmendmentWithUkefId>>;

jest.mock('../../../../server/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../../server/v1/api'),
  patchPortalFacilitySubmitAmendment: () => patchPortalFacilitySubmitAmendmentMock(),
}));

const originalProcessEnv = { ...process.env };

const validFacilityId = new ObjectId().toString();

const validAmendmentId = new ObjectId().toString();

const invalidId = 'invalid-id';

const dealId = new ObjectId().toString();
const referenceNumber = `${new ObjectId().toString()}-01`;
const bankId = '1';
const bankName = 'Bank Name';

const validPayload = {
  newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
  referenceNumber,
  ...portalAmendmentToUkefEmailVariables(),
  bankId,
  bankName,
  requestDate: 1673728000,
};

describe('/v1/gef/facilities/:facilityId/amendments/:amendmentId/submit-amendment', () => {
  let testUsers: Awaited<ReturnType<typeof testUserCache.initialise>>;
  let checker1: TestUser;

  describe('PATCH /v1/gef/facilities/:facilityId/amendments/:amendmentId/submit-amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    beforeAll(async () => {
      testUsers = await testUserCache.initialise(app);
      checker1 = testUsers().withRole(CHECKER).one() as TestUser;
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
        const url = patchSubmitAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(checker1).patch(validPayload).to(url);

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
        const url = patchSubmitAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(checker1).patch(validPayload).to(url);

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
        makeRequestWithoutAuthHeader: () => patch(patchSubmitAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId })),
        makeRequestWithAuthHeader: (authHeader: string) =>
          patch(patchSubmitAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId }), { headers: { Authorization: authHeader } }),
      });

      withRoleAuthorisationTests({
        allowedRoles: [CHECKER],
        getUserWithRole: (role: Role) => testUsers().withRole(role).one() as TestUser,
        makeRequestAsUser: (user: TestUser) =>
          as(user)
            .patch(validPayload)
            .to(patchSubmitAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId })),
        successStatusCode: HttpStatusCode.Ok,
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the facility id path param is invalid`, async () => {
        // Arrange
        const url = patchSubmitAmendmentUrl({ facilityId: invalidId, amendmentId: validAmendmentId });

        // Act
        const response = await as(checker1).patch(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a ${HttpStatusCode.BadRequest} response when the payload is invalid`, async () => {
        // Arrange
        const url = patchSubmitAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        const invalidPayload = { newStatus: PORTAL_AMENDMENT_STATUS.DRAFT };

        // Act
        const response = await as(checker1).patch(invalidPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
      });

      it(`should return a ${HttpStatusCode.Ok} response and the amendment for an authenticated user`, async () => {
        const newAmendmentId = new ObjectId().toString();
        const newFacilityId = new ObjectId().toString();

        // Arrange
        const amendment: PortalFacilityAmendmentWithUkefId = {
          amendmentId: newAmendmentId,
          facilityId: newFacilityId,
          dealId,
          type: AMENDMENT_TYPES.PORTAL,
          ukefFacilityId: '123',
          createdAt: 1702061978881,
          updatedAt: 1702061978881,
          status: PORTAL_AMENDMENT_STATUS.DRAFT,
          referenceNumber,
          eligibilityCriteria: { version: 1, criteria: [] },
          createdBy: {
            username: checker1.username,
            name: checker1.firstname,
            email: checker1.email,
          },
          tfm: {},
        };

        jest.mocked(patchPortalFacilitySubmitAmendmentMock).mockResolvedValue(amendment);
        const url = patchSubmitAmendmentUrl({ facilityId: newFacilityId, amendmentId: newAmendmentId });

        // Act
        const response = await as(checker1).patch(validPayload).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        expect(response.body).toEqual(amendment);
      });
    });
  });
});

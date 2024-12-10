import { ObjectId } from 'mongodb';
import { AMENDMENT_STATUS, AMENDMENT_TYPES, AnyObject, FacilityAmendmentWithUkefId, InvalidAmendmentIdError, InvalidFacilityIdError } from '@ukef/dtfs2-common';
import app from '../../../../src/createApp';
import testUserCache from '../../../api-test-users';

import { MAKER } from '../../../../src/v1/roles/roles';
import { getAmendmentUrl } from './get-amendment-url';
import createApi from '../../../api';
import { TestUser } from '../../../types/test-user';

const { as, get } = createApi(app);

const getPortalFacilityAmendmentMock = jest.fn() as jest.Mock<Promise<FacilityAmendmentWithUkefId>>;

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
  let aMaker: TestUser;

  describe('GET /v1/gef/facilities/:facilityId/amendments/:amendmentId', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    beforeAll(async () => {
      testUsers = await testUserCache.initialise(app);
      aMaker = testUsers().withRole(MAKER).one() as TestUser;
    });

    afterAll(() => {
      jest.restoreAllMocks();
      process.env = originalProcessEnv;
    });

    describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is disabled', () => {
      beforeEach(() => {
        process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'false';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('returns a 404 response', async () => {
        // Arrange
        const url = getAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await as(aMaker).get(url);

        // Assert
        expect(response.status).toEqual(404);
      });
    });

    describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled', () => {
      beforeEach(() => {
        process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('returns a 401 response when user is not authenticated', async () => {
        // Arrange
        const url = getAmendmentUrl({ facilityId: validFacilityId, amendmentId: validAmendmentId });

        // Act
        const response = await get(url);

        // Assert
        expect(response.status).toEqual(401);
      });

      it('returns a 400 response when the facility id path param is invalid', async () => {
        // Arrange
        jest.mocked(getPortalFacilityAmendmentMock).mockRejectedValueOnce(new InvalidFacilityIdError(invalidId));

        const url = getAmendmentUrl({ facilityId: invalidId, amendmentId: validAmendmentId });

        // Act
        const response = await as(aMaker).get(url);

        // Assert
        expect(response.status).toEqual(400);
      });

      it('returns a 400 response when the amendment id path param is invalid', async () => {
        // Arrange
        jest.mocked(getPortalFacilityAmendmentMock).mockRejectedValueOnce(new InvalidAmendmentIdError(invalidId));

        const url = getAmendmentUrl({ facilityId: validFacilityId, amendmentId: invalidId });

        // Act
        const response = await as(aMaker).get(url);

        // Assert
        expect(response.status).toEqual(400);
      });

      it('returns the amendment for an authenticated user', async () => {
        const amendmentId = new ObjectId().toString();
        const facilityId = new ObjectId().toString();
        const dealId = new ObjectId().toString();

        // Arrange
        const amendment: FacilityAmendmentWithUkefId = {
          amendmentId: new ObjectId(amendmentId),
          facilityId: new ObjectId(facilityId),
          dealId: new ObjectId(dealId),
          type: AMENDMENT_TYPES.PORTAL,
          ukefFacilityId: '123',
          createdAt: 1702061978881,
          updatedAt: 1702061978881,
          status: AMENDMENT_STATUS.IN_PROGRESS,
          version: 1,
        };

        jest.mocked(getPortalFacilityAmendmentMock).mockResolvedValue(amendment);
        const url = getAmendmentUrl({ facilityId, amendmentId });

        // Act
        const response = await as(aMaker).get(url);

        // Assert
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ ...amendment, amendmentId, facilityId, dealId });
      });
    });
  });
});

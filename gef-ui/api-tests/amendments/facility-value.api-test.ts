// eslint-disable-next-line import/no-extraneous-dependencies
import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { MAKER } from '../../server/constants/roles';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import { createApi } from '../create-api';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';

const originalEnv = { ...process.env };

const { get } = createApi(app);

jest.mock('csurf', () => () => (_req: Request, _res: Response, next: NextFunction) => next());
jest.mock('../../server/middleware/csrf', () => ({
  csrfToken: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

api.getFacility = jest.fn();
api.getApplication = jest.fn();
api.updateFacility = jest.fn();
api.updateApplication = jest.fn();

const dealId = '123';
const facilityId = '111';
const amendmentId = '111';

describe('bank review date routes', () => {
  beforeEach(async () => {
    await storage.flush();
  });

  afterAll(async () => {
    jest.resetAllMocks();
    await storage.flush();
  });

  const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/facility-value`;

  describe(url, () => {
    let sessionCookie: string;

    beforeEach(async () => {
      ({ sessionCookie } = await storage.saveUserSession([MAKER]));
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    describe('with portal facility amendments disabled', () => {
      beforeEach(() => {
        process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'false';
      });

      it('should redirect to /not-found', async () => {
        // Act
        const response = await getWithSessionCookie(url, sessionCookie);

        // Assert
        expect(response.status).toEqual(302);
        expect(response.headers.location).toEqual('/not-found');
      });
    });

    describe('with portal facility amendments enabled', () => {
      beforeEach(() => {
        process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers: Headers) => get(url, {}, headers),
        whitelistedRoles: [MAKER],
        successCode: 200,
      });

      it('should return status 200 when user logged in as maker', async () => {
        // Act
        const response = await getWithSessionCookie(url, sessionCookie);

        // Assert
        expect(response.status).toEqual(200);
      });
    });
  });
});

function getWithSessionCookie(url: string, sessionCookie: string) {
  return get(
    url,
    {},
    {
      Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
    },
  );
}

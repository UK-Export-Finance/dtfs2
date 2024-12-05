import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { MAKER } from '../../server/constants/roles';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import { createApi } from '../create-api';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';
import { Deal } from '../../server/types/deal';

const originalEnv = { ...process.env };

const { get } = createApi(app);

jest.mock('csurf', () => () => (_req: Request, _res: Response, next: NextFunction) => next());
jest.mock('../../server/middleware/csrf', () => ({
  csrfToken: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

const dealId = '123';
const facilityId = '111';

const url = `/application-details/${dealId}/facilities/${facilityId}/amendments/what-needs-to-change`;

describe(`GET ${url}`, () => {
  let sessionCookie: string;

  beforeEach(async () => {
    await storage.flush();
    jest.resetAllMocks();

    ({ sessionCookie } = await storage.saveUserSession([MAKER]));
    jest.spyOn(api, 'getApplication').mockResolvedValue({ exporter: { companyName: 'test exporter' } } as Deal);
  });

  afterAll(async () => {
    jest.resetAllMocks();
    await storage.flush();
    process.env = originalEnv;
  });

  describe('with portal facility amendments disabled', () => {
    beforeEach(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'false';
    });

    it('should redirect to /not-found', async () => {
      // Act
      const response = await getWithSessionCookie(sessionCookie);

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
      const response = await getWithSessionCookie(sessionCookie);

      // Assert
      expect(response.status).toEqual(200);
    });
  });
});

function getWithSessionCookie(sessionCookie: string) {
  return get(
    url,
    {},
    {
      Cookie: [`dtfs-session=${encodeURIComponent(sessionCookie)}`],
    },
  );
}

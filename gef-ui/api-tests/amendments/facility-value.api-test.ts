// eslint-disable-next-line import/no-extraneous-dependencies
import { Headers } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { MAKER } from '../../server/constants/roles';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';
import { createApi } from '../create-api';
import api from '../../server/services/api';
import * as storage from '../test-helpers/storage/storage';

const { get } = createApi(app);

jest.mock('csurf', () => () => (_req: Request, _res: Response, next: NextFunction) => next());
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('../../server/middleware/csrf', () => ({
  ...jest.requireActual('../../server/routes/middleware/csrf'),
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
    describe('with portal facility amendments enabled', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers: Headers) => get(url, {}, headers),
        whitelistedRoles: [MAKER],
        successCode: 200,
      });
    });
  });
});

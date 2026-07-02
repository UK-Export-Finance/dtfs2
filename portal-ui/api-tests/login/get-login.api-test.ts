import { ROLES } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/api-test';
import type { RequestHeaders } from '@ukef/dtfs2-common';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common'),
  verify: jest.fn((_req: unknown, _res: unknown, next: () => void): void => {
    next();
  }),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

describe('GET /login', () => {
  const { get } = createApi(app);
  const allRoles = Object.values(ROLES);

  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers: RequestHeaders) => get('/login', {}, headers),
    whitelistedRoles: allRoles,
    successCode: 200,
  });
});

import { ROLES } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/api-test';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';
import app from '../../server/createApp';

const { get, post } = createApi(app);

const allRoles = Object.values(ROLES);

const pwdResetToken = 'pwd-reset-token';

type RequestHeaders = {
  Cookie: string | string[];
};

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

describe('GET /logout', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => get('/logout', {}, headers),
    whitelistedRoles: allRoles,
    successCode: 302,
    successHeaders: { location: '/login' },
  });
});

describe('GET /reset-password', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => get('/reset-password', {}, headers),
    whitelistedRoles: allRoles,
    successCode: 200,
  });
});

describe('POST /reset-password', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => post({}, headers).to('/reset-password'),
    whitelistedRoles: allRoles,
    successCode: 200,
  });
});

describe('GET /reset-password/:pwdResetToken', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => get(`/reset-password/${pwdResetToken}`, {}, headers),
    whitelistedRoles: allRoles,
    successCode: 200,
  });
});

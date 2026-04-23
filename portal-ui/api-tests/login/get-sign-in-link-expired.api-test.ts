import { createApi } from '@ukef/dtfs2-common/api-test';
import type { RequestHeaders } from '@ukef/dtfs2-common';
import app from '../../server/createApp';
import { withPartial2faAuthValidationApiTests } from '../common-tests/partial-2fa-auth-validation-api-tests';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common'),
  verify: jest.fn((_req: unknown, _res: unknown, next: () => void): void => {
    next();
  }),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  validatePartialAuthToken: jest.fn(),
}));

describe('GET /login/sign-in-link-expired', () => {
  const { get } = createApi(app);

  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => get('/login/sign-in-link-expired', {}, headers),
    validateResponseWasSuccessful: (response: { status: number }) => expect(response.status).toEqual(302),
  });
});

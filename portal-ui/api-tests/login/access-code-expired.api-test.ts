import { createApi } from '@ukef/dtfs2-common/api-test';
import type { IncomingHttpHeaders } from 'http';
import type { Response as SuperTestResponse } from 'supertest';
import { HttpStatusCode } from 'axios';
import app from '../../server/createApp';
import { withPartial2faAuthValidationApiTests } from '../common-tests/partial-2fa-auth-validation-api-tests';
import { sendSignInLink } from '../../server/api';

jest.mock('../../server/api', () => ({
  sendSignInLink: jest.fn(),
}));

const mockedSendSignInLink = jest.mocked(sendSignInLink);
const { get } = createApi(app);

describe('GET /login/access-code-expired', () => {
  const originalEnv = process.env.FF_PORTAL_2FA_ENABLED;

  beforeAll(() => {
    process.env.FF_PORTAL_2FA_ENABLED = 'true';
  });

  afterAll(() => {
    process.env.FF_PORTAL_2FA_ENABLED = originalEnv;
  });

  beforeEach(() => {
    mockedSendSignInLink.mockResolvedValue({ data: { attemptsLeft: 2 } });
  });

  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers: IncomingHttpHeaders) => get('/login/access-code-expired', {}, headers),
    validateResponseWasSuccessful: (response: SuperTestResponse) => {
      expect(response.status).toBe(HttpStatusCode.Ok);
    },
  });

  it('should return 200 for a valid session', async () => {
    const response = await get('/login/access-code-expired');
    expect(response.status).toBe(HttpStatusCode.Ok);
  });
});

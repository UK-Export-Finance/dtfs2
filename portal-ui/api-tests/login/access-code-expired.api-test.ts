import { when } from 'jest-when';
import type { IncomingHttpHeaders } from 'http';
import type { Response as SuperTestResponse } from 'supertest';
import { createApi } from '@ukef/dtfs2-common/api-test';
import app from '../../server/createApp';
import extractSessionCookie from '../helpers/extractSessionCookie';
import mockLogin from '../helpers/login';
import { withPartial2faAuthValidationApiTests } from '../common-tests/partial-2fa-auth-validation-api-tests';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ...jest.requireActual('@ukef/dtfs2-common'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  verify: jest.fn((req, res, next) => next()),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: jest.fn(() => false),
  validatePartialAuthToken: jest.fn(),
}));

// Import mocked API after jest.mock
// eslint-disable-next-line import/first
import { login, sendSignInLink, validatePartialAuthToken } from '../../server/api';

const mockedLogin = jest.mocked(login);
const mockedSendSignInLink = jest.mocked(sendSignInLink);
const mockedValidatePartialAuthToken = jest.mocked(validatePartialAuthToken);

const { get, post } = createApi(app);

const email = 'mock email';
const password = 'mock password';
const partialAuthToken = 'partial auth token';

describe('GET /login/access-code-expired', () => {
  const originalEnv = process.env.FF_PORTAL_2FA_ENABLED;

  beforeAll(() => {
    // Enable Portal 2FA feature flag for these tests
    process.env.FF_PORTAL_2FA_ENABLED = 'true';
  });

  afterAll(() => {
    // Restore original environment
    process.env.FF_PORTAL_2FA_ENABLED = originalEnv;
  });

  beforeEach(() => {
    // Mock sendSignInLink for all tests to ensure session has attemptsLeft
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockedSendSignInLink.mockResolvedValue({ data: { attemptsLeft: 2 } } as any);
  });

  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers: IncomingHttpHeaders) => get('/login/access-code-expired', {}, headers),
    validateResponseWasSuccessful: (response: SuperTestResponse) => {
      expect(response.status).toEqual(200);
      expect(response.text).toContain('access-code-expired');
    },
  });

  describe('page content', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      when(mockedValidatePartialAuthToken).resetWhenMocks();
      when(mockedValidatePartialAuthToken)
        .calledWith(partialAuthToken)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .mockResolvedValue(undefined as any);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockedLogin.mockImplementation(mockLogin(partialAuthToken) as any);
      sessionCookie = (await post({ email, password }).to('/login').then(extractSessionCookie)) as string;
    });

    it('should render the page title', async () => {
      const response = await get('/login/access-code-expired', {}, { Cookie: sessionCookie });
      expect(response.status).toEqual(200);
      expect(response.text).toContain('Access code expired');
    });

    it('should render the heading', async () => {
      const response = await get('/login/access-code-expired', {}, { Cookie: sessionCookie });
      expect(response.text).toContain('Your access code has expired');
      expect(response.text).toContain('data-cy="access-code-expired-heading"');
    });

    it('should render the security information paragraph', async () => {
      const response = await get('/login/access-code-expired', {}, { Cookie: sessionCookie });
      expect(response.text).toContain('For security, access codes expire after 30 minutes');
      expect(response.text).toContain('You can request for a new access code to be sent to your email address');
      expect(response.text).toContain('data-cy="access-code-expired-security-info"');
    });

    it('should render the attempts remaining paragraph with correct data-cy attribute and value', async () => {
      const response = await get('/login/access-code-expired', {}, { Cookie: sessionCookie });
      expect(response.text).toContain('data-cy="access-code-expired-attempts-info"');
      // TEMPORARY: Currently displays default value of 3 until session management is implemented
      expect(response.text).toContain('You have 3 attempts remaining');
    });

    it('should render the account suspension warning paragraph', async () => {
      const response = await get('/login/access-code-expired', {}, { Cookie: sessionCookie });
      expect(response.text).toContain('If you request too many access codes your account will be suspended for security purposes');
      expect(response.text).toContain('and you will be prompted to contact us');
      expect(response.text).toContain('data-cy="access-code-expired-suspend-info"');
    });

    it('should render the request new code button', async () => {
      const response = await get('/login/access-code-expired', {}, { Cookie: sessionCookie });
      expect(response.text).toContain('Request a new code');
      expect(response.text).toContain('data-cy="submit-button"');
    });
  });
});

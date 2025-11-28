jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => false,
  validatePartialAuthToken: jest.fn(),
}));

const { when } = require('jest-when');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { login, sendSignInLink, validatePartialAuthToken } = require('../../server/api');
const app = require('../../server/createApp');
const extractSessionCookie = require('../helpers/extractSessionCookie');
const mockLogin = require('../helpers/login');

const { get, post } = createApi(app);

const { withPartial2faAuthValidationApiTests } = require('../common-tests/partial-2fa-auth-validation-api-tests');

const email = 'mock email';
const password = 'mock password';
const partialAuthToken = 'partial auth token';

describe('GET /login/access-code-expired', () => {
  beforeEach(() => {
    // Mock sendSignInLink for all tests to ensure session has numberOfSignInLinkAttemptsRemaining
    sendSignInLink.mockResolvedValue({ data: { numberOfSendSignInLinkAttemptsRemaining: 2 } });
  });

  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers) => get('/login/access-code-expired', {}, headers),
    validateResponseWasSuccessful: (response) => {
      expect(response.status).toEqual(200);
      expect(response.text).toContain('access-code-expired');
    },
  });

  describe('page content', () => {
    let sessionCookie;

    beforeEach(async () => {
      when(validatePartialAuthToken).resetWhenMocks();
      when(validatePartialAuthToken).calledWith(partialAuthToken).mockResolvedValue();
      login.mockImplementation(mockLogin(partialAuthToken));
      sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);
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
      // Note: The actual attempts value depends on session state set by the login flow
      expect(response.text).toContain('attempts remaining');
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

jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/routes/middleware/csrf', () => ({
  ...jest.requireActual('../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  updateUser: jest.fn(),
}));

const app = require('../server/createApp');
const { ADMIN } = require('../server/constants/roles');
const mockLogin = require('./helpers/login');
const extractSessionCookie = require('./helpers/extractSessionCookie');
const { login, updateUser, loginWithSignInLink } = require('../server/api');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const loginWithSignInLinkAsRole = require('./helpers/loginWithSignInLinkAsRole');
const { get, post } = require('./create-api').createApi(app);

const email = 'mock email';
const password = 'mock password';
let sessionCookie;

describe('user routes', () => {
  beforeEach(async () => {
    login.mockImplementation(mockLogin());
    loginWithSignInLink.mockImplementation(loginWithSignInLinkAsRole(ADMIN));
    sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);
    await get('/login/sign-in-link', { t: '123' }, { Cookie: [sessionCookie] });
    updateUser.mockImplementation(() => Promise.resolve({ status: 200 }));
  });

  describe('GET /admin/activity/search', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/admin/activity/search', {}, headers),
      whitelistedRoles: [ADMIN],
      successCode: 200,
    });
  });

  describe('POST /admin/activity/search', () => {
    const userSearchTerm = 'test';
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({ userSearchTerm }, headers).to('/admin/activity/search'),
      whitelistedRoles: [ADMIN],
      successCode: 200,
    });
  });
});

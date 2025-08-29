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
  banks: jest.fn(),
  user: jest.fn(),
}));
jest.mock('../server/helpers/getApiData', () => () => []);

const {
  ROLES: { ADMIN },
} = require('@ukef/dtfs2-common');
const app = require('../server/createApp');
const mockLogin = require('./helpers/login');
const extractSessionCookie = require('./helpers/extractSessionCookie');
const { login, updateUser, loginWithSignInLink } = require('../server/api');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const loginWithSignInLinkAsRole = require('./helpers/loginWithSignInLinkAsRole');
const { SIGN_IN_TOKEN_LINK_TOKEN } = require('./fixtures/sign-in-token-constants');
const { get, post } = require('./create-api').createApi(app);

const email = 'mock email';
const password = 'mock password';
const _id = '64f736071f0fd6ecf617db8a';
const token = SIGN_IN_TOKEN_LINK_TOKEN.EXAMPLE_ONE;
const userId = '61e567d7db41bd65b00bd47a';
let sessionCookie;

describe('user routes', () => {
  beforeEach(async () => {
    login.mockImplementation(mockLogin());
    loginWithSignInLink.mockImplementation(loginWithSignInLinkAsRole(ADMIN));
    sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);
    await get('/login/sign-in-link', { t: token, u: userId }, { Cookie: [sessionCookie] });
    updateUser.mockImplementation(() => Promise.resolve({ status: 200 }));
  });

  describe('GET /admin/users', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/admin/users', {}, headers),
      whitelistedRoles: [ADMIN],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /admin/users/create', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/admin/users/create', {}, headers),
      whitelistedRoles: [ADMIN],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /admin/users/create', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/admin/users/create'),
      whitelistedRoles: [ADMIN],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /admin/users/edit/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/admin/users/edit/${_id}`, {}, headers),
      whitelistedRoles: [ADMIN],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /admin/users/edit/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/admin/users/edit/${_id}`),
      whitelistedRoles: [ADMIN],
      successCode: 302,
      successHeaders: { location: '/admin/users' },
    });

    describe('happy path', () => {
      it("redirects to '/admin/users' if the Portal API call to update the user returns a 200", async () => {
        const response = await post({}, { Cookie: [sessionCookie] }).to(`/admin/users/edit/${_id}`);

        expect(response.status).toEqual(302);
        expect(response.headers.location).toEqual('/admin/users');
      });
    });

    describe('unhappy path', () => {
      it('returns a 200 (i.e., re-renders the user edit page) if the Portal API call to update the user returns a 400', async () => {
        updateUser.mockImplementation(() => Promise.resolve({ status: 400, data: {} }));

        const response = await post({}, { Cookie: [sessionCookie] }).to(`/admin/users/edit/${_id}`);

        expect(response.status).toEqual(200);
      });
    });
  });

  describe('GET /admin/users/disable/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/admin/users/disable/${_id}`, {}, headers),
      whitelistedRoles: [ADMIN],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /admin/users/enable/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/admin/users/enable/${_id}`, {}, headers),
      whitelistedRoles: [ADMIN],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /admin/users/:_id/change-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/admin/users/${_id}/change-password`, {}, headers),
      whitelistedRoles: [ADMIN],
      successCode: 200,
    });
  });

  describe('POST /admin/users/:_id/change-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/admin/users/${_id}/change-password`),
      whitelistedRoles: [ADMIN],
      successCode: 302,
      successHeaders: { location: `/admin/users/edit/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});

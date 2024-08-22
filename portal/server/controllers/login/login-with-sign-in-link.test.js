const { when } = require('jest-when');
const { ROLES, PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');
const { loginWithSignInLink } = require('./login-with-sign-in-link');
const CONSTANTS = require('../../constants');

jest.mock('../../api');
const api = require('../../api');

describe('loginWithSignInLink', () => {
  const userId = '65626dc0bda51f77a78b86ae';
  const signInToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const loginResponseUserToken = 'a token';
  const a2faToken = 'aToken';
  const loginStatus = PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD;
  const userEmail = 'an-email@example.com';
  const user = {
    _id: userId,
    email: userEmail,
    roles: [],
  };

  let req;
  let session;
  let res;

  beforeEach(() => {
    session = { userToken: a2faToken, numberOfSendSignInLinkAttemptsRemaining: 1, userEmail, _id: userId };
    req = { session, query: { t: signInToken, u: userId } };
    res = { status: jest.fn().mockReturnThis(), render: jest.fn(), redirect: jest.fn() };
    api.loginWithSignInLink = jest.fn();
  });

  const mockSuccessfulLoginApiCall = (opts) => {
    when(api.loginWithSignInLink)
      .calledWith({ token: a2faToken, userId, signInToken })
      .mockResolvedValueOnce({
        token: loginResponseUserToken,
        loginStatus,
        user: { ...user, roles: opts?.userRoles ?? [] },
      });
  };

  const mockLoginApiCallToRejectWith = (error) => {
    when(api.loginWithSignInLink).calledWith({ token: a2faToken, userId, signInToken }).mockRejectedValueOnce(error);
  };

  it('saves the login response to the session', async () => {
    mockSuccessfulLoginApiCall();

    await loginWithSignInLink(req, res);

    expect(session.userToken).toBe(loginResponseUserToken);
    expect(session.user).toEqual(user);
    expect(session.loginStatus).toBe(loginStatus);
    expect(session.dashboardFilters).toBe(CONSTANTS.DASHBOARD.DEFAULT_FILTERS);
  });

  it('deletes the numberOfSendSignInLinkAttemptsRemaining from the session', async () => {
    mockSuccessfulLoginApiCall();

    await loginWithSignInLink(req, res);

    expect(session.numberOfSendSignInLinkAttemptsRemaining).toBe(undefined);
  });

  it('deletes the userEmail from the session', async () => {
    mockSuccessfulLoginApiCall();

    await loginWithSignInLink(req, res);

    expect(session.userEmail).toBe(undefined);
  });

  it.each`
    role                            | redirectUrl
    ${ROLES.ADMIN}                  | ${CONSTANTS.LANDING_PAGES.DEFAULT}
    ${ROLES.CHECKER}                | ${CONSTANTS.LANDING_PAGES.DEFAULT}
    ${ROLES.MAKER}                  | ${CONSTANTS.LANDING_PAGES.DEFAULT}
    ${ROLES.PAYMENT_REPORT_OFFICER} | ${CONSTANTS.LANDING_PAGES.UTILISATION_REPORT_UPLOAD}
    ${ROLES.READ_ONLY}              | ${CONSTANTS.LANDING_PAGES.DEFAULT}
  `("renders the post-login-redirect template with the '$redirectUrl' url when the user has the '$role' role", async ({ role, redirectUrl }) => {
    mockSuccessfulLoginApiCall({ userRoles: role });

    await loginWithSignInLink(req, res);

    expect(res.render).toHaveBeenCalledWith('login/post-login-redirect.njk', {
      redirectUrl,
    });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns a redirect to the sign in link expired page if the login attempt returns a token expired 403 error', async () => {
    mockLoginApiCallToRejectWith({
      response: { status: 403, data: { errors: [{ cause: CONSTANTS.HTTP_ERROR_CAUSES.TOKEN_EXPIRED }] } },
    });

    await loginWithSignInLink(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/login/sign-in-link-expired');
  });

  it('returns a redirect to the account suspended page if the login attempt returns a user blocked 403 error', async () => {
    mockLoginApiCallToRejectWith({
      response: { status: 403, data: { errors: [{ cause: CONSTANTS.HTTP_ERROR_CAUSES.USER_BLOCKED }] } },
    });

    await loginWithSignInLink(req, res);

    expect(res.render).toHaveBeenCalledWith('login/temporarily-suspended.njk');
  });

  it('returns a redirect to the log in page if the login attempt returns a 401 error', async () => {
    mockLoginApiCallToRejectWith({ response: { status: 401 } });

    await loginWithSignInLink(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  it('returns a redirect to the log in page if the login attempt returns a 404 error', async () => {
    mockLoginApiCallToRejectWith({ response: { status: 404 } });

    await loginWithSignInLink(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  it('returns a 500 response with the problem with service page if the login attempt has an unexpected error', async () => {
    mockLoginApiCallToRejectWith(new Error());

    await loginWithSignInLink(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
  });

  it('returns a 400 response with the problem with service page if the u query string is not a valid userId', async () => {
    const reqWithInvalidUserId = {
      ...req,
      query: {
        ...req.query,
        u: '123',
      },
    };

    await testItReturnsA400ResponseWithTheProblemWithServicePage(reqWithInvalidUserId, res);
  });

  it('returns a 400 response with the problem with service page if the u query string is empty', async () => {
    const reqWithEmptyUserId = {
      ...req,
      query: {
        ...req.query,
        u: '',
      },
    };

    await testItReturnsA400ResponseWithTheProblemWithServicePage(reqWithEmptyUserId, res);
  });

  it('returns a 400 response with the problem with service page if the u query string is not provided', async () => {
    const reqWithMissingUserId = {
      ...req,
      query: {
        t: req.query.t,
      },
    };

    await testItReturnsA400ResponseWithTheProblemWithServicePage(reqWithMissingUserId, res);
  });

  it('returns a 400 response with the problem with service page if the t query string is not a valid signInToken', async () => {
    const reqWithInvalidSignInToken = {
      ...req,
      query: {
        ...req.query,
        t: 'not-a-hex-string',
      },
    };

    await testItReturnsA400ResponseWithTheProblemWithServicePage(reqWithInvalidSignInToken, res);
  });

  it('returns a 400 response with the problem with service page if the t query string is empty', async () => {
    const reqWithEmptySignInToken = {
      ...req,
      query: {
        ...req.query,
        t: '',
      },
    };

    await testItReturnsA400ResponseWithTheProblemWithServicePage(reqWithEmptySignInToken, res);
  });

  it('returns a 400 response with the problem with service page if the t query string is not provided', async () => {
    const reqWithMissingSignInToken = {
      ...req,
      query: {
        u: req.query.u,
      },
    };

    await testItReturnsA400ResponseWithTheProblemWithServicePage(reqWithMissingSignInToken, res);
  });

  async function testItReturnsA400ResponseWithTheProblemWithServicePage(theReq, theRes) {
    await loginWithSignInLink(theReq, theRes);

    expect(theRes.status).toHaveBeenCalledWith(400);
    expect(theRes.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
  }
});

const { when } = require('jest-when');
const { generateNoUserLoggedInAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { login } = require('./login.controller');
const { userIsBlocked, userIsDisabled, usernameOrPasswordIncorrect } = require('../../constants/login-results');
const { UserService } = require('./user.service');
const controller = require('./controller');
const utils = require('../../crypto/utils');
const { STATUS } = require('../../constants/user');

jest.mock('./controller', () => ({
  findByUsername: jest.fn(),
  updateLastLoginAndResetSignInData: jest.fn(),
  incrementFailedLoginCount: jest.fn(),
  updateSessionIdentifier: jest.fn(),
}));

jest.mock('../../crypto/utils', () => ({
  validPassword: jest.fn(),
  issueValidUsernameAndPasswordJWT: jest.fn(),
}));

jest.mock('../email', () => jest.fn());

describe('login', () => {
  const userService = new UserService();
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const USERNAME = 'aUsername';
  const PASSWORD = 'aPassword';
  const EMAIL = 'anEmail@aDomain.com';
  const USERID = 'aUserId';
  const ERROR = 'an error';
  const SALT = 'aSalt';
  const HASH = 'aHash';
  const SESSION_IDENTIFIER = 'aSessionIdentifier';
  const TOKEN_OBJECT = { example: 'tokenObject' };

  const USER = {
    'user-status': 'active',
    disabled: false,
    hash: HASH,
    salt: SALT,
    email: EMAIL,
    _id: USERID,
  };

  it('returns user email, id and token when the user exists and the password is correct', async () => {
    mockFindByUsernameSuccess(USER);
    mockValidPasswordSuccess();
    mockIssueJWTSuccess(USER);
    mockUpdateSessionIdentifier(USER);

    const result = await login(USERNAME, PASSWORD, userService, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ userEmail: EMAIL, tokenObject: TOKEN_OBJECT, userId: USERID });
  });

  it("returns a 'usernameOrPasswordIncorrect' error when the user doesn't exist", async () => {
    mockFindByUsernameReturnsNullUser();
    mockValidPasswordSuccess();
    mockIssueJWTSuccess(USER);
    mockUpdateSessionIdentifier(USER);

    const result = await login(USERNAME, PASSWORD, userService, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: usernameOrPasswordIncorrect });
  });

  it('returns an error if findByUsername returns an error message', async () => {
    mockFindByUsernameReturnsError();
    mockValidPasswordSuccess();
    mockIssueJWTSuccess(USER);
    mockUpdateSessionIdentifier(USER);

    const result = await login(USERNAME, PASSWORD, userService, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: ERROR });
  });

  it("returns a 'usernameOrPasswordIncorrect' error when the password is incorrect", async () => {
    mockFindByUsernameSuccess(USER);
    mockValidPasswordFailure();
    mockIssueJWTSuccess(USER);
    mockUpdateSessionIdentifier(USER);

    const result = await login(USERNAME, PASSWORD, userService, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: usernameOrPasswordIncorrect });
  });

  it("throws a 'UserDisabledError' when the user is disabled", async () => {
    const DISABLED_USER = { ...USER, disabled: true };

    mockFindByUsernameSuccess(DISABLED_USER);
    mockValidPasswordSuccess();
    mockIssueJWTSuccess(DISABLED_USER);
    mockUpdateSessionIdentifier(DISABLED_USER);

    const result = await login(USERNAME, PASSWORD, userService, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: userIsDisabled });
  });

  it("throws a 'UserBlockedError' when the user is blocked", async () => {
    const BLOCKED_USER = { ...USER, 'user-status': STATUS.BLOCKED };

    mockFindByUsernameSuccess(BLOCKED_USER);
    mockValidPasswordSuccess();
    mockIssueJWTSuccess(BLOCKED_USER);
    mockUpdateSessionIdentifier(BLOCKED_USER);

    const result = await login(USERNAME, PASSWORD, userService, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: userIsBlocked });
  });

  it("returns a 'usernameOrPasswordIncorrect' error when the password is incorrect and the user is disabled", async () => {
    const DISABLED_USER = { ...USER, disabled: true };

    mockFindByUsernameSuccess(DISABLED_USER);
    mockValidPasswordFailure();
    mockIssueJWTSuccess(DISABLED_USER);
    mockUpdateSessionIdentifier(DISABLED_USER);

    const result = await login(USERNAME, PASSWORD, userService, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: usernameOrPasswordIncorrect });
  });

  it("returns a 'usernameOrPasswordIncorrect' error when the password is incorrect and the user is blocked", async () => {
    const BLOCKED_USER = { ...USER, 'user-status': STATUS.BLOCKED };

    mockFindByUsernameSuccess(BLOCKED_USER);
    mockValidPasswordFailure();
    mockIssueJWTSuccess(BLOCKED_USER);
    mockUpdateSessionIdentifier(BLOCKED_USER);

    const result = await login(USERNAME, PASSWORD, userService, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: usernameOrPasswordIncorrect });
  });

  function mockFindByUsernameSuccess(user) {
    when(controller.findByUsername)
      .calledWith(USERNAME, expect.anything())
      .mockImplementation((username, callback) => callback(null, user));
  }

  function mockFindByUsernameReturnsNullUser() {
    when(controller.findByUsername)
      .calledWith(USERNAME, expect.anything())
      .mockImplementation((username, callback) => callback(null, null));
  }

  function mockFindByUsernameReturnsError() {
    when(controller.findByUsername)
      .calledWith(USERNAME, expect.anything())
      .mockImplementation((username, callback) => callback(ERROR, null));
  }

  function mockValidPasswordFailure() {
    when(utils.validPassword).calledWith(PASSWORD, HASH, SALT).mockReturnValue(false);
  }

  function mockValidPasswordSuccess() {
    when(utils.validPassword).calledWith(PASSWORD, HASH, SALT).mockReturnValue(true);
  }

  function mockIssueJWTSuccess(user) {
    when(utils.issueValidUsernameAndPasswordJWT)
      .calledWith(user)
      .mockReturnValue({ sessionIdentifier: SESSION_IDENTIFIER, ...TOKEN_OBJECT });
  }

  function mockUpdateSessionIdentifier(user) {
    when(controller.updateSessionIdentifier)
      .calledWith(user, SESSION_IDENTIFIER, generateNoUserLoggedInAuditDetails(), expect.anything())
      .mockImplementation((aUser, sessionIdentifier, auditDetails, callback) => {
        callback();
      });
  }
});

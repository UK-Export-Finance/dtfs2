jest.mock('../user.controller', () => ({
  findByUsername: jest.fn(),
  updateLastLoginAndResetSignInData: jest.fn(),
  incrementFailedLoginCount: jest.fn(),
}));

jest.mock('../../../../utils/crypto.util', () => ({
  validPassword: jest.fn(),
  issueJWT: jest.fn(),
}));

const { when } = require('jest-when');
const { generateNoUserLoggedInAuditDetails, generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { loginCallback: login } = require('./loginCallback.helper');
const { usernameOrPasswordIncorrect, userIsBlocked, userIsDisabled } = require('../../../../constants/login-results.constant');
const controller = require('../user.controller');
const utils = require('../../../../utils/crypto.util');

describe('loginCallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const USERNAME = 'aUsername';
  const PASSWORD = 'aPassword';
  const ERROR = 'an error';
  const SALT = 'aSalt';
  const HASH = 'aHash';
  const SESSION_IDENTIFIER = 'aSessionIdentifier';
  const TOKEN_OBJECT = { example: 'tokenObject' };

  const USER = {
    status: 'active',
    disabled: false,
    hash: HASH,
    salt: SALT,
  };

  it('returns the user and token when the user exists and the password is correct', async () => {
    mockFindByUsernameSuccess(USER);
    mockValidPasswordSuccess();
    mockIssueJWTSuccess(USER);
    mockupdateLastLoginAndResetSignInDataSuccess(USER);

    const result = await login(USERNAME, PASSWORD, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ user: USER, tokenObject: TOKEN_OBJECT });
  });

  it("returns a 'usernameOrPasswordIncorrect' error when the user doesn't exist", async () => {
    mockFindByUsernameReturnsNullUser();
    mockValidPasswordSuccess();
    mockIssueJWTSuccess(USER);
    mockupdateLastLoginAndResetSignInDataSuccess(USER);

    const result = await login(USERNAME, PASSWORD, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: usernameOrPasswordIncorrect });
  });

  it('returns an error if findByUsername returns an error message', async () => {
    mockFindByUsernameReturnsError();
    mockValidPasswordSuccess();
    mockIssueJWTSuccess(USER);
    mockupdateLastLoginAndResetSignInDataSuccess(USER);

    const result = await login(USERNAME, PASSWORD, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: ERROR });
  });

  it("returns a 'usernameOrPasswordIncorrect' error when the password is incorrect", async () => {
    mockFindByUsernameSuccess(USER);
    mockValidPasswordFailure();
    mockIssueJWTSuccess(USER);
    mockupdateLastLoginAndResetSignInDataSuccess(USER);

    const result = await login(USERNAME, PASSWORD, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: usernameOrPasswordIncorrect });
  });

  it("returns a 'userIsDisabled' error when the user is disabled", async () => {
    const DISABLED_USER = { ...USER, disabled: true };

    mockFindByUsernameSuccess(DISABLED_USER);
    mockValidPasswordSuccess();
    mockIssueJWTSuccess(DISABLED_USER);
    mockupdateLastLoginAndResetSignInDataSuccess(DISABLED_USER);

    const result = await login(USERNAME, PASSWORD, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: userIsDisabled });
  });

  it("returns a 'userIsBlocked' error when the user is blocked", async () => {
    const BLOCKED_USER = { ...USER, status: 'blocked' };

    mockFindByUsernameSuccess(BLOCKED_USER);
    mockValidPasswordSuccess();
    mockIssueJWTSuccess(BLOCKED_USER);
    mockupdateLastLoginAndResetSignInDataSuccess(BLOCKED_USER);

    const result = await login(USERNAME, PASSWORD, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: userIsBlocked });
  });

  it("returns a 'usernameOrPasswordIncorrect' error when the password is incorrect and the user is disabled", async () => {
    const DISABLED_USER = { ...USER, disabled: true };

    mockFindByUsernameSuccess(DISABLED_USER);
    mockValidPasswordFailure();
    mockIssueJWTSuccess(DISABLED_USER);
    mockupdateLastLoginAndResetSignInDataSuccess(DISABLED_USER);

    const result = await login(USERNAME, PASSWORD, generateNoUserLoggedInAuditDetails());

    expect(result).toEqual({ error: usernameOrPasswordIncorrect });
  });

  it("returns a 'usernameOrPasswordIncorrect' error when the password is incorrect and the user is blocked", async () => {
    const BLOCKED_USER = { ...USER, status: 'blocked' };

    mockFindByUsernameSuccess(BLOCKED_USER);
    mockValidPasswordFailure();
    mockIssueJWTSuccess(BLOCKED_USER);
    mockupdateLastLoginAndResetSignInDataSuccess(BLOCKED_USER);

    const result = await login(USERNAME, PASSWORD, generateNoUserLoggedInAuditDetails());

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
    when(utils.issueJWT)
      .calledWith(user)
      .mockReturnValue({ sessionIdentifier: SESSION_IDENTIFIER, ...TOKEN_OBJECT });
  }

  function mockupdateLastLoginAndResetSignInDataSuccess(user) {
    when(controller.updateLastLoginAndResetSignInData)
      .calledWith(user, SESSION_IDENTIFIER, generateTfmAuditDetails(user._id), expect.anything())
      .mockImplementation((aUser, sessionIdentifier, auditDetails, callback) => {
        callback();
      });
  }
});

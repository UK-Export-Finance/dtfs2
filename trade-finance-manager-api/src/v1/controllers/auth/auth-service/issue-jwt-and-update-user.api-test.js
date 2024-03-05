const { execute } = require('./issue-jwt-and-update-user');
const utils = require('../../../../utils/crypto.util');
const userController = require('../../user/user.controller');
const MOCK_TFM_USERS = require('../../../__mocks__/mock-users');

const MOCK_TFM_USER = MOCK_TFM_USERS[0];

const mockIssueJwtResponse = utils.issueJWT(MOCK_TFM_USER);

const { sessionIdentifier, ...tokenObject } = mockIssueJwtResponse;

describe('auth-service/issue-jwt-and-update-user', () => {
  let result;

  beforeAll(async () => {
    utils.issueJWT = jest.fn(() => mockIssueJwtResponse);
    userController.updateLastLoginAndResetSignInData = jest.fn().mockResolvedValue();

    result = await execute(MOCK_TFM_USER);
  });

  it('should call userController.updateLastLoginAndResetSignInData with the provided TFM user and a sessionIdentifier', () => {
    expect(userController.updateLastLoginAndResetSignInData).toHaveBeenCalledTimes(1);

    expect(userController.updateLastLoginAndResetSignInData).toHaveBeenCalledWith(MOCK_TFM_USER, sessionIdentifier);
  });

  it('should return a token', () => {
    const expected = tokenObject.token;

    expect(result).toEqual(expected);
  });
});

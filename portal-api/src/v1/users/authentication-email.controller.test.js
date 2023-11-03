const { when } = require('jest-when');
const { validateAuthenticationEmailToken } = require('./authentication-email.controller');

jest.mock('../email');

jest.mock('../../crypto/utils');
const utils = require('../../crypto/utils');

jest.mock('./controller');
const userController = require('./controller');
const { MAKER } = require('../roles/roles');

describe('authentication email controller', () => {
  describe('validateAuthenticationEmailToken', () => {
    const TEST_USER = {
      username: 'HSBC-maker-1',
      password: 'P@ssword1234',
      firstname: 'Mister',
      surname: 'One',
      email: 'one@email.com',
      timezone: 'Europe/London',
      roles: [MAKER],
      bank: {
        id: '961',
        name: 'HSBC',
        emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
      },
    };

    const TEST_TOKEN = '1234567890';

    const SUCCESSFUL_JWT = {
      token: `Bearer ${TEST_TOKEN}`,
      expires: '12h',
      sessionIdentifier: 'MockSessionId',
    };

    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it('should return the token and user if the validation is successful', async () => {
      when(utils.issueValid2faJWT).calledWith(TEST_USER).mockReturnValue(SUCCESSFUL_JWT);
      when(userController.updateLastLogin)
        .calledWith(TEST_USER, SUCCESSFUL_JWT.sessionIdentifier, expect.any(Function))
        .mockImplementation((user, sessionIdentifier, callback) => callback());

      const { tokenObject, user } = await validateAuthenticationEmailToken(TEST_USER, TEST_TOKEN);

      expect(tokenObject).toEqual({ token: SUCCESSFUL_JWT.token, expires: SUCCESSFUL_JWT.expires });
      expect(user).toEqual(TEST_USER);
    });

    it('should throw an error if issuing of the JWT fails', async () => {
      when(utils.issueValid2faJWT)
        .calledWith(TEST_USER)
        .mockImplementation(() => {
          throw new Error('User does not have a session identifier');
        });
      when(userController.updateLastLogin)
        .calledWith(TEST_USER, SUCCESSFUL_JWT.sessionIdentifier, expect.any(Function))
        .mockImplementation((user, sessionIdentifier, callback) => callback());

      await expect(validateAuthenticationEmailToken(TEST_USER, TEST_TOKEN)).rejects.toThrow('User does not have a session identifier');
    });

    it('should throw an error if updating last login fails', async () => {
      when(utils.issueValid2faJWT).calledWith(TEST_USER).mockReturnValue(SUCCESSFUL_JWT);

      when(userController.updateLastLogin)
        .calledWith(TEST_USER, SUCCESSFUL_JWT.sessionIdentifier, expect.any(Function))
        .mockImplementation(() => {
          throw new Error('Invalid User Id');
        });

      await expect(validateAuthenticationEmailToken(TEST_USER, TEST_TOKEN)).rejects.toThrow('Invalid User Id');
    });
  });
});

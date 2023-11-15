const { ObjectId } = require('mongodb');
const { when } = require('jest-when');
const { validateSignInLinkToken } = require('./authentication-email.controller');

jest.mock('../email');

jest.mock('../../crypto/utils');
const utils = require('../../crypto/utils');

jest.mock('./controller');
const userController = require('./controller');
const { MAKER } = require('../roles/roles');

jest.mock('../../drivers/db-client');
const db = require('../../drivers/db-client');

const SignInLinkExpiredError = require('../errors/sign-in-link-expired.error');

const { SIGN_IN_LINK_DURATION } = require('../../constants');
const originalSignInLinkDurationMinutes = SIGN_IN_LINK_DURATION.MINUTES;

describe('authentication email controller', () => {
  describe('validateSignInLinkToken', () => {
    const TEST_USER = {
      _id: new ObjectId(),
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

    const { password, ...TEST_USER_WITHOUT_PASSWORD } = TEST_USER;

    const TEST_TOKEN = '1234567890';

    const SUCCESSFUL_JWT = {
      token: `Bearer ${TEST_TOKEN}`,
      expires: '12h',
      sessionIdentifier: 'MockSessionId',
    };

    beforeEach(async () => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      SIGN_IN_LINK_DURATION.MINUTES = originalSignInLinkDurationMinutes;
    })

    const mockFindingUserInDbWithSignInLinkExpiringAt = (signInLinkExpiry) => {
      const findOneMock = jest.fn();
      const updateOneMock = jest.fn();

      const userInDb = {
        ...TEST_USER_WITHOUT_PASSWORD,
      }

      if (signInLinkExpiry) {
        userInDb.signInCode = {
          expiry: signInLinkExpiry,
        }
      }

      when(db.getCollection).calledWith('users').mockResolvedValue({ findOne: findOneMock, updateOne: updateOneMock });

      when(findOneMock).calledWith({ _id: { $eq: ObjectId(TEST_USER._id) } }).mockResolvedValue(userInDb);

      return updateOneMock;
    }

    const mockSuccessfulIssueValid2faJWT = () => {
      when(utils.issueValid2faJWT).calledWith(TEST_USER).mockReturnValue(SUCCESSFUL_JWT);
    }

    const mockSuccessfulUpdateLastLogin = () => {
      when(userController.updateLastLogin)
        .calledWith(TEST_USER, SUCCESSFUL_JWT.sessionIdentifier, expect.any(Function))
        .mockImplementation((user, sessionIdentifier, callback) => callback());
    }

    const mockSuccessful2faLogin = () => {
      mockSuccessfulIssueValid2faJWT();
      mockSuccessfulUpdateLastLogin();
    }

    it('should return the token and user if the validation is successful', async () => {
      const usersUpdateOneMock = mockFindingUserInDbWithSignInLinkExpiringAt(new Date().getTime() + SIGN_IN_LINK_DURATION.MILLISECONDS);

      mockSuccessful2faLogin();

      const { tokenObject, user } = await validateSignInLinkToken(TEST_USER, TEST_TOKEN);

      expect(usersUpdateOneMock).toHaveBeenCalledTimes(1);
      expect(usersUpdateOneMock).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(TEST_USER._id) } },
        { $unset: { signInCode: '' } }
      );
      expect(tokenObject).toEqual({ token: SUCCESSFUL_JWT.token, expires: SUCCESSFUL_JWT.expires });
      expect(user).toEqual(TEST_USER);
    });

    it('should throw a SignInLinkExpiredError if the sign in link has already been visited', async () => {  
      mockFindingUserInDbWithSignInLinkExpiringAt(undefined);

      await expect(validateSignInLinkToken(TEST_USER, TEST_TOKEN)).rejects.toThrow(SignInLinkExpiredError);
      await expect(validateSignInLinkToken(TEST_USER, TEST_TOKEN)).rejects.toThrow('Link has already been visited');
    });

    it('should throw a SignInLinkExpiredError if the sign in code has expired', async () => {
      SIGN_IN_LINK_DURATION.MINUTES = 2;
  
      mockFindingUserInDbWithSignInLinkExpiringAt(new Date().getTime() - 1);

      await expect(validateSignInLinkToken(TEST_USER, TEST_TOKEN)).rejects.toThrow(SignInLinkExpiredError);
      await expect(validateSignInLinkToken(TEST_USER, TEST_TOKEN)).rejects.toThrow('Link is older than 2 minutes');
    });

    it('should throw a SignInLinkExpiredError with the correct message if the sign in code has expired and was valid for 1 minute', async () => {
      SIGN_IN_LINK_DURATION.MINUTES = 1;

      mockFindingUserInDbWithSignInLinkExpiringAt(new Date().getTime() - 1);

      await expect(validateSignInLinkToken(TEST_USER, TEST_TOKEN)).rejects.toThrow(SignInLinkExpiredError);
      await expect(validateSignInLinkToken(TEST_USER, TEST_TOKEN)).rejects.toThrow('Link is older than 1 minute');
    });

    it('should throw an error if issuing of the JWT fails', async () => {
      mockFindingUserInDbWithSignInLinkExpiringAt(new Date().getTime() + SIGN_IN_LINK_DURATION.MILLISECONDS);

      when(utils.issueValid2faJWT)
        .calledWith(TEST_USER)
        .mockImplementation(() => {
          throw new Error('User does not have a session identifier');
        });

      mockSuccessfulUpdateLastLogin();

      await expect(validateSignInLinkToken(TEST_USER, TEST_TOKEN)).rejects.toThrow('User does not have a session identifier');
    });

    it('should throw an error if updating last login fails', async () => {
      mockFindingUserInDbWithSignInLinkExpiringAt(new Date().getTime() + SIGN_IN_LINK_DURATION.MILLISECONDS);

      mockSuccessfulIssueValid2faJWT();

      when(userController.updateLastLogin)
        .calledWith(TEST_USER, SUCCESSFUL_JWT.sessionIdentifier, expect.any(Function))
        .mockImplementation(() => {
          throw new Error('Invalid User Id');
        });

      await expect(validateSignInLinkToken(TEST_USER, TEST_TOKEN)).rejects.toThrow('Invalid User Id');
    });
  });
});

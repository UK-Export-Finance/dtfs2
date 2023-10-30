const { when } = require('jest-when');
const crypto = require('node:crypto');
const { ObjectId } = require('mongodb');
const sendEmail = require('../email');

const { createAndEmailSignInLink } = require('./sign-in-link.service');
const db = require('../../drivers/db-client');
const { SIGN_IN_LINK_EXPIRY_MINUTES, EMAIL_TEMPLATE_IDS } = require('../../constants');

jest.mock('../email');
jest.mock('node:crypto', () => ({
  ...jest.requireActual('node:crypto'),
  randomBytes: jest.fn(),
  pbkdf2Sync: jest.fn(),
}));
jest.mock('../../drivers/db-client');

describe('sign in link service', () => {
  const hash = '0123456789abcdef0123456789abcdef';
  const salt = 'abcdef0123456789abcdef0123456789';
  const token = '0a1b2c3d4e5f67890a1b2c3d4e5f6789';
  const user = {
    _id: 'aaaa1234aaaabbbb5678bbbb',
    firstname: 'a first name',
    surname: 'a last name',
    email: 'an email',
  };
  const signInLink = `https://localhost/login/authentication-token?t=${token}`;
  let usersCollection;

  beforeEach(() => {
    jest.resetAllMocks();
    usersCollection = {
      updateOne: jest.fn(),
    };
  });

  describe('createAndEmailSignInLink', () => {
    describe('when creating the sign in link token fails', () => {
      const createSignInLinkTokenError = new Error();

      beforeEach(() => {
        when(crypto.randomBytes).calledWith(32).mockImplementationOnce(() => { throw createSignInLinkTokenError; });
      });

      testCreatingAndEmailingTheSignInLinkRejects({
        expectedCause: createSignInLinkTokenError,
        expectedMessage: 'Failed to create a sign in code.'
      });
    });

    describe('when creating the sign in link token succeeds', () => {
      beforeEach(() => {
        when(crypto.randomBytes).calledWith(32)
          .mockReturnValueOnce(Buffer.from(token, 'hex'));
      });

      describe('when creating the salt fails', () => {
        const createSaltError = new Error();

        beforeEach(() => {
          when(crypto.randomBytes).calledWith(32).mockImplementationOnce(() => { throw createSaltError; });
        });

        testCreatingAndEmailingTheSignInLinkRejects({
          expectedCause: createSaltError,
          expectedMessage: 'Failed to save the sign in code.'
        });
      });

      describe('when creating the salt succeeds', () => {
        beforeEach(() => {
          when(crypto.randomBytes).calledWith(32).mockReturnValueOnce(Buffer.from(salt, 'hex'));
        });

        describe('when creating the hash fails', () => {
          const createHashError = new Error();

          beforeEach(() => {
            when(crypto.pbkdf2Sync)
              .calledWith(token, salt, 10000, 64, 'sha512')
              .mockImplementationOnce(() => { throw createHashError; });
          });

          testCreatingAndEmailingTheSignInLinkRejects({
            expectedCause: createHashError,
            expectedMessage: 'Failed to save the sign in code.'
          });
        });

        describe('when creating the hash succeeds', () => {
          beforeEach(() => {
            when(crypto.pbkdf2Sync)
              .calledWith(token, salt, 10000, 64, 'sha512')
              .mockReturnValueOnce(Buffer.from(hash, 'hex'));
          });

          describe('when getting the users collection fails', () => {
            const getCollectionError = new Error();

            beforeEach(() => {
              when(db.getCollection).calledWith('users').mockRejectedValueOnce(getCollectionError);
            });

            testCreatingAndEmailingTheSignInLinkRejects({
              expectedCause: getCollectionError,
              expectedMessage: 'Failed to save the sign in code.'
            });
          });

          describe('when updating the user fails', () => {
            const updateOneUserError = new Error();

            beforeEach(() => {
              when(db.getCollection).calledWith('users').mockResolvedValueOnce(usersCollection);
              usersCollection.updateOne.mockRejectedValueOnce(updateOneUserError);
            });

            testCreatingAndEmailingTheSignInLinkRejects({
              expectedCause: updateOneUserError,
              expectedMessage: 'Failed to save the sign in code.'
            });
          });

          describe('when saving the hash and salt to the db does not reject', () => {
            beforeEach(() => {
              usersCollection = {
                updateOne: jest.fn(),
              };

              when(db.getCollection)
                .calledWith('users')
                .mockResolvedValueOnce(usersCollection);
            });

            it('saves the sign in link token hash and salt to the db', async () => {
              await createAndEmailSignInLink(user);

              expect(usersCollection.updateOne).toHaveBeenCalledWith(
                { _id: { $eq: ObjectId(user._id) } },
                { $set: { signInCode: { hash, salt } } }
              );
            });

            it('sends the sign in link email to the user', async () => {
              await createAndEmailSignInLink(user);

              expect(sendEmail).toHaveBeenCalledWith(
                EMAIL_TEMPLATE_IDS.SIGN_IN_LINK,
                user.email,
                {
                  firstName: user.firstname,
                  lastName: user.surname,
                  signInLink,
                  signInLinkExpiryMinutes: SIGN_IN_LINK_EXPIRY_MINUTES,
                },
              );
            });

            describe('when sending the sign in link email fails', () => {
              const sendEmailError = new Error();

              beforeEach(() => {
                sendEmail.mockImplementationOnce(() => { throw sendEmailError; });
              });

              testCreatingAndEmailingTheSignInLinkRejects({
                expectedCause: sendEmailError,
                expectedMessage: 'Failed to email the sign in code.'
              });
            });

            describe('when sending the sign in link email does not reject', () => {
              beforeEach(() => {
                sendEmail.mockResolvedValueOnce(undefined);
              });

              it('resolves', async () => {
                const createAndEmailSignInLinkPromise = createAndEmailSignInLink(user);
                await expect(createAndEmailSignInLinkPromise).resolves.toBe(undefined);
              });
            });
          });
        });
      });
    });
  });

  async function testCreatingAndEmailingTheSignInLinkRejects({ expectedMessage, expectedCause }) {
    it('rejects', async () => {
      const createAndEmailSignInLinkPromise = createAndEmailSignInLink(user);

      await expect(createAndEmailSignInLinkPromise)
        .rejects.toThrowError(expectedMessage);
      await expect(createAndEmailSignInLinkPromise)
        .rejects.toHaveProperty('cause', expectedCause);
    });
  }
});

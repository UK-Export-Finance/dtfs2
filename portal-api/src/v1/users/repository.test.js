const { when } = require('jest-when');
const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');
const { UserRepository } = require('./repository');

jest.mock('../../drivers/db-client');

describe('UserRepository', () => {
  let repository;
  let usersCollection;

  beforeEach(() => {
    jest.resetAllMocks();
    repository = new UserRepository();

    usersCollection = {
      updateOne: jest.fn(),
    };
    when(db.getCollection)
      .calledWith('users')
      .mockResolvedValueOnce(usersCollection);
  });

  describe('saveSignInTokenForUser', () => {
    const userId = 'aaaa1234aaaabbbb5678bbbb';
    const hashHexString = 'a1';
    const saltHexString = 'b2';
    const hash = Buffer.from(hashHexString, 'hex');
    const salt = Buffer.from(saltHexString, 'hex');

    it('saves the hex strings for the hash and salt on the user document', async () => {
      await repository.saveSignInTokenForUser({
        userId,
        signInTokenSalt: salt,
        signInTokenHash: hash,
      });

      expect(usersCollection.updateOne).toHaveBeenCalledWith(
        { _id: { $eq: ObjectId(userId) } },
        { $set: { signInToken: { hashHex: hashHexString, saltHex: saltHexString } } }
      );
    });
  });
});

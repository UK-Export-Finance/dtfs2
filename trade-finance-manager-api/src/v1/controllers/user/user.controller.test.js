const { findByEmails } = require('./user.controller');
const db = require('../../../drivers/db-client');
const { generateArrayOfEmailsRegex } = require('./helpers/generateArrayOfEmailsRegex');
const handleFindByEmailsResult = require('./helpers/handleFindByEmailsResult');
const MOCK_TFM_USERS = require('../../__mocks__/mock-users');

const MOCK_TFM_USER = MOCK_TFM_USERS[0];

let mockGetCollection;
let mockCollectionFind;

describe('user.controller', () => {
  describe('findByEmails', () => {
    const mockUsers = [MOCK_TFM_USER];
    const mockEmails = [MOCK_TFM_USER.email]

    beforeAll(async () => {
      mockCollectionFind = jest.fn().mockReturnThis(mockUsers);

      mockGetCollection = jest.fn().mockResolvedValue({
        find: mockCollectionFind,
        toArray: jest.fn().mockReturnValue(mockUsers),
      });

      jest.spyOn(db, 'getCollection').mockImplementation(mockGetCollection);

      await findByEmails(mockEmails);
    });

    it('should call db.getCollection', () => {
      expect(mockGetCollection).toHaveBeenCalledTimes(1);
      expect(mockGetCollection).toHaveBeenCalledWith('tfm-users');
    });

    it('should call collection.find with an email regex', () => {
      expect(mockCollectionFind).toHaveBeenCalledTimes(1);

      const emailsRegex = generateArrayOfEmailsRegex(mockEmails);

      expect(mockCollectionFind).toHaveBeenCalledWith({ 'email': { $in: emailsRegex } });
    });

    it('should return the result of handleFindByEmailsResult', async () => {
      const result = await findByEmails([MOCK_TFM_USER.email]);

      const expected = handleFindByEmailsResult([MOCK_TFM_USER]);

      expect(result).toEqual(expected);
    });
  });
});

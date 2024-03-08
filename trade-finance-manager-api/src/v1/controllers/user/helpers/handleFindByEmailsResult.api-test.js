const handleFindByEmailsResult = require('./handleFindByEmailsResult');
const MOCK_TFM_USERS = require('../../../__mocks__/mock-users');

const MOCK_TFM_USER = MOCK_TFM_USERS[0];

describe('handleFindByEmailsResult', () => {
  describe('when there is one user', () => {
    it('should return an object with user data, found=true and canProceed=true', () => {
      const mockUsers = [MOCK_TFM_USER];

      const result = handleFindByEmailsResult(mockUsers);

      const expected = {
        found: true,
        canProceed: true,
        ...MOCK_TFM_USER,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is more than 1 user is found', () => {
    it('should return an object with user data, found=true and canProceed=false', () => {
      const mockUsers = [MOCK_TFM_USER, MOCK_TFM_USER];

      const result = handleFindByEmailsResult(mockUsers);

      const expected = { found: true, canProceed: false };

      expect(result).toEqual(expected);
    });
  });

  describe('when users is not populated', () => {
    it('should return an object with found=false', () => {
      const result = handleFindByEmailsResult([]);

      const expected = { found: false };

      expect(result).toEqual(expected);
    });
  });

  describe('when users is not provided', () => {
    it('should return an object with found=false', () => {
      const result = handleFindByEmailsResult();

      const expected = { found: false };

      expect(result).toEqual(expected);
    });
  });
});

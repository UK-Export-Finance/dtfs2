const { generateArrayOfEmailsRegex } = require('./generateArrayOfEmailsRegex');
const MOCK_USERS = require('../../../__mocks__/mock-users');

const mockEmail = MOCK_USERS[0].email;
const expectedRegex = RegExp(`^${mockEmail.replace('.', '\\.')}$`, 'i');

describe('generateArrayOfEmailsRegex', () => {

  describe('generateArrayOfEmailsRegex', () => {
    it('should return an array of regular expressions', () => {
      const mockEmails = [mockEmail, mockEmail];

      const result = generateArrayOfEmailsRegex(mockEmails);

      const expected = [ expectedRegex, expectedRegex ];

      expect(result).toEqual(expected);
    });
  });
});

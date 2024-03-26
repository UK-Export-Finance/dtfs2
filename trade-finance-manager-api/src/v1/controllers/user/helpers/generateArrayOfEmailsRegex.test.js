const { regex, generateArrayOfEmailsRegex } = require('./generateArrayOfEmailsRegex');
const MOCK_USERS = require('../../../__mocks__/mock-users');

const mockEmail = MOCK_USERS[0].email;
const mockEmailInRegex = mockEmail.replace('.', '\\.');

describe('generateArrayOfEmailsRegex', () => {
  describe('regex', () => {
    it('should return a regular expression', () => {
      const result = regex(mockEmail);

      const expected = new RegExp(`^${mockEmailInRegex}$`, 'i');

      expect(result).toEqual(expected);
    });
  });

  describe('generateArrayOfEmailsRegex', () => {
    it('should return an array of regular expressions', () => {
      const mockEmails = [mockEmail, mockEmail];

      const result = generateArrayOfEmailsRegex(mockEmails);

      const expected = [
        regex(mockEmails[0]),
        regex(mockEmails[1]),
      ];

      expect(result).toEqual(expected);
    });
  });
});

/* eslint-disable no-underscore-dangle */
import userHelpers from './user';

const {
  userFullName,
} = userHelpers;

describe('user shelpers', () => {
  describe('userFullName', () => {
    it('should return first and last name', () => {
      const mockUser = {
        firstName: 'Test',
        lastName: 'testing',
      };
      const result = userFullName(mockUser);

      const expected = `${mockUser.firstName} ${mockUser.lastName}`;
      expect(result).toEqual(expected);
    });
  });
});

/* eslint-enable no-underscore-dangle */

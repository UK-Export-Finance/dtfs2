/* eslint-disable no-underscore-dangle */
import userHelpers from './user';

const {
  userFullName,
  userIsInTeam,
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

  describe('userIsInTeam', () => {
    it('should return true when user is in a team', () => {
      const mockUser = {
        teams: ['TEAMA'],
      };

      const result = userIsInTeam(mockUser, 'TEAMA');
      expect(result).toEqual(true);
    });

    it('should return false when user is NOT in a team', () => {
      const mockUser = {
        teams: ['TEAMB'],
      };

      const result = userIsInTeam(mockUser, 'TEAMA');
      expect(result).toEqual(false);
    });
  });
});

/* eslint-enable no-underscore-dangle */

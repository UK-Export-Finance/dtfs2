/* eslint-disable no-underscore-dangle */
import { userFullName, userIsInTeam } from './user';

describe('user helpers', () => {
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
        teams: ['TEAM1'],
      };

      const result = userIsInTeam(mockUser, ['TEAM1']);
      expect(result).toEqual(true);
    });

    it('should return false when user is NOT in a team', () => {
      const mockUser = {
        teams: ['TEAM1'],
      };

      const result = userIsInTeam(mockUser, ['TEAM2']);
      expect(result).toEqual(false);
    });
  });
});

/* eslint-enable no-underscore-dangle */

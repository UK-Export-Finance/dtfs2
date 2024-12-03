import { TeamId } from '@ukef/dtfs2-common';
import { userFullName, userIsInTeam, userIsOnlyInTeams } from './user';
import { TfmSessionUser } from '../types/tfm-session-user';

describe('user helpers', () => {
  describe('userFullName', () => {
    it('should return first and last name', () => {
      // Arrange
      const mockUser = {
        firstName: 'Test',
        lastName: 'testing',
      } as TfmSessionUser;

      // Act
      const result = userFullName(mockUser);

      // Assert
      const expected = `${mockUser.firstName} ${mockUser.lastName}`;
      expect(result).toEqual(expected);
    });
  });

  describe('userIsInTeam', () => {
    it('should return true when user is in the correct team', () => {
      // Arrange
      const teams: TeamId[] = ['BUSINESS_SUPPORT'];
      const mockUser = { teams } as TfmSessionUser;

      // Act
      const result = userIsInTeam(mockUser, teams);

      // Assert
      expect(result).toEqual(true);
    });

    it('should return false when user is NOT in a team', () => {
      // Arrange
      const teams: TeamId[] = ['BUSINESS_SUPPORT'];
      const mockUser = { teams } as TfmSessionUser;
      const teamIdList: TeamId[] = ['PIM'];

      // Act
      const result = userIsInTeam(mockUser, teamIdList);

      // Assert
      expect(result).toEqual(false);
    });
  });

  describe('userIsOnlyInTeams', () => {
    it('should return false when user teams do not match', () => {
      // Arrange
      const teams: TeamId[] = ['BUSINESS_SUPPORT', 'PIM'];
      const mockUser = { teams } as TfmSessionUser;
      const teamIdList: TeamId[] = ['BUSINESS_SUPPORT'];

      // Act
      const result = userIsOnlyInTeams(mockUser, teamIdList);

      // Assert
      expect(result).toEqual(false);
    });

    it('should return true when the user teams match', () => {
      // Arrange
      const teams: TeamId[] = ['BUSINESS_SUPPORT', 'PIM'];
      const mockUser = { teams } as TfmSessionUser;
      const teamIdList = teams;

      // Act
      const result = userIsOnlyInTeams(mockUser, teamIdList);

      // Assert
      expect(result).toEqual(true);
    });
  });
});

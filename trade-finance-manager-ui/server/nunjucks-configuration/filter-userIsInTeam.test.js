import userIsInTeam from './filter-userIsInTeam';
import { TEAM_IDS } from '../constants';

describe('nunjucks filters - userIsInTeam', () => {
  it("returns false when 'user.teams' is undefined", () => {
    // Arrange
    const user = {};

    // Act
    const result = userIsInTeam(user, TEAM_IDS.UNDERWRITERS);

    // Assert
    expect(result).toBe(false);
  });

  it("should return false when 'user.teams' is an empty array", () => {
    // Arrange
    const user = { teams: [] };

    // Act
    const result = userIsInTeam(user, TEAM_IDS.UNDERWRITERS);

    // Assert
    expect(result).toBe(false);
  });

  describe.each(Object.values(TEAM_IDS))("when the query team id is '%s'", (teamId) => {
    it('should return false if the user is in every team except the query team id', () => {
      // Arrange
      const teams = Object.values(TEAM_IDS).filter((id) => id !== teamId).map((id) => ({ id }));
      const user = { teams };

      // Act
      const result = userIsInTeam(user, teamId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true if the user is in the queried team', () => {
      // Arrange
      const user = { teams: [{ id: teamId }] };

      // Act
      const result = userIsInTeam(user, teamId);

      // Assert
      expect(result).toBe(true);
    });
  });
});

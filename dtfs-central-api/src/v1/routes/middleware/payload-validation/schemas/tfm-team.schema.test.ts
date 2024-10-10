import { TEAM_IDS, TeamId } from '@ukef/dtfs2-common';
import { TfmTeamSchema } from './tfm-team.schema';

describe('tfm-team.schema', () => {
  describe('TfmTeamSchema', () => {
    it.each(Object.values(TEAM_IDS))("sets the 'success' property to true when the team is '%s'", (team) => {
      // Act
      const { success } = TfmTeamSchema.safeParse(team);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to false when the team is not a valid team", () => {
      // Arrange
      const invalidTeam = 'some-team';

      // Act
      const { success } = TfmTeamSchema.safeParse(invalidTeam);

      // Assert
      expect(success).toEqual(false);
    });

    it("set the 'data' property to the parsed team", () => {
      // Arrange
      const team: TeamId = 'PDC_READ';

      // Act
      const { data } = TfmTeamSchema.safeParse(team);

      // Assert
      expect(data).toEqual(team);
    });
  });
});

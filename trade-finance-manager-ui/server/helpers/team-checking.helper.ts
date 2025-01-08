import { ALL_TEAM_IDS, TeamId } from '@ukef/dtfs2-common';

export type TeamToCheck = {
  teams: TeamId[];
  url: string;
  description: string;
};

/** This is only used to create combinations to check team validation and is not used in the business programming */
export const getTeamCombinations = () => {
  const teamIdCombinations: TeamToCheck[] = [];

  // We add these to the start of the array for easier navigation
  ALL_TEAM_IDS.forEach((teamId) => {
    teamIdCombinations.push({ teams: [teamId], url: teamId, description: teamId });
  });

  ALL_TEAM_IDS.forEach((teamId1) => {
    ALL_TEAM_IDS.forEach((teamId2) => {
      if (teamId1 !== teamId2) {
        const teams = [teamId1, teamId2];
        teamIdCombinations.push({ teams, url: teams.join('/'), description: teams.join(' and ') });
      }
    });
  });

  return teamIdCombinations;
};

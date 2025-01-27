import { ALL_TEAM_IDS, TeamId } from '@ukef/dtfs2-common';

export type TeamToCheck = {
  teams: TeamId[];
  url: string;
  description: string;
};

/**
 * Generates an array of team combinations for validation purposes.
 * Each combination consists of a single team ID, its corresponding URL, and description.
 */
export const getTeamCombinations = (): TeamToCheck[] =>
  // We add these to the start of the array for easier navigation
  ALL_TEAM_IDS.map((teamId) => ({ teams: [teamId], url: teamId, description: teamId }));

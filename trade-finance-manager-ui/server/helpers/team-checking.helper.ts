import { ALL_TEAM_IDS, TeamId } from '@ukef/dtfs2-common';

/**
 * Type containing the team ID, URL for use in the team checking view model
 */
export type TeamToCheck = {
  teams: TeamId[];
  url: string;
  description: string;
};

/**
 * Generates an array of team combinations for rendering the team checking view model.
 * Each combination consists of a single team ID, its corresponding URL, and description.
 * @link TeamCheckingViewModel
 */
export const getTeamCombinations = (): TeamToCheck[] => ALL_TEAM_IDS.map((teamId) => ({ teams: [teamId], url: teamId, description: teamId }));

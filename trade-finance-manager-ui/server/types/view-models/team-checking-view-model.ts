import { TeamId, TfmSessionUser } from '@ukef/dtfs2-common';
import { TeamToCheck } from '../../helpers/team-checking.helper';

/**
 * View model for the team checking page.
 * Contains props to construct a page showing all user team combinations as hyperlinks,
 * as well as the current user's teams and whether they are in the current team.
 */
export type TeamCheckingPageViewModel = {
  user: TfmSessionUser;
  currentUserTeams: TeamId[];
  currentPageTeamRestrictions?: TeamToCheck;
  isUserInTeam: boolean;
  teamCombinations: TeamToCheck[];
};

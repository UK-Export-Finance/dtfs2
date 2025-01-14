import { TeamId } from '@ukef/dtfs2-common';
import { TeamToCheck } from '../../helpers/team-checking.helper';

export type TeamCheckingPageViewModel = {
  currentUserTeams: TeamId[];
  currentPageTeamRestrictions?: TeamToCheck;
  isUserInTeam: boolean;
  teamCombinations: TeamToCheck[];
};

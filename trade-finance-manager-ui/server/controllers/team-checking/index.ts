import { Request, Response } from 'express';
import { TeamToCheck } from '../../helpers/team-checking.helper';
import { asUserSession } from '../../helpers/express-session';
import { userIsInTeam } from '../../helpers/user';
import { TeamCheckingPageViewModel } from '../../types/view-models';

type RenderTeamsCheckerProps = {
  teamCombinations: TeamToCheck[];
  currentPageTeamRestrictions?: TeamToCheck;
};

/**
 * Renders the team checking page.
 * @param params.req
 * @param params.res
 * @param params.RenderTeamsCheckerProps
 * @returns
 */
export const renderTeamsChecker = (req: Request, res: Response, { teamCombinations, currentPageTeamRestrictions }: RenderTeamsCheckerProps) => {
  const { user } = asUserSession(req.session);

  const isUserInTeam = !!currentPageTeamRestrictions && userIsInTeam(user, currentPageTeamRestrictions.teams);

  const teamCheckingPageViewModel: TeamCheckingPageViewModel = {
    user,
    currentUserTeams: user.teams,
    currentPageTeamRestrictions,
    isUserInTeam,
    teamCombinations,
  };

  return res.render('team-checking/team-checking-page.njk', teamCheckingPageViewModel);
};

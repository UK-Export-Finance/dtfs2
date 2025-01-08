import { Request, Response } from 'express';
import { TeamToCheck } from '../../helpers/team-checking.helper';
import { asUserSession } from '../../helpers/express-session';

type RenderTeamsCheckerProps = {
  teamCombinations: TeamToCheck[];
  currentPageTeamRestrictions?: TeamToCheck;
};

export const renderTeamsChecker = (req: Request, res: Response, { teamCombinations, currentPageTeamRestrictions }: RenderTeamsCheckerProps) => {
  const { user } = asUserSession(req.session);

  return res.render('role-checking/index.njk', { currentUserTeams: user.teams, currentPageTeamRestrictions, teamCombinations });
};

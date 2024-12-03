import { PDC_TEAM_IDS } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import { userIsOnlyInTeams } from '../../helpers/user';

/**
 * Route to handle default user routing when redirected.
 * If no user is logged in, this sends the user to the
 * login page. If a user is logged in, this sends the
 * user to their respective 'home' page depending on
 * their team.
 */
export const getUserHomepage = (req: Request, res: Response) => {
  const { user } = req.session;
  if (!user) {
    return res.redirect('/');
  }

  const userIsOnlyInPdcTeam = Object.values(PDC_TEAM_IDS).some((pdcTeamId) => userIsOnlyInTeams(user, [pdcTeamId]));
  if (userIsOnlyInPdcTeam) {
    return res.redirect('/utilisation-reports');
  }
  return res.redirect('/deals');
};

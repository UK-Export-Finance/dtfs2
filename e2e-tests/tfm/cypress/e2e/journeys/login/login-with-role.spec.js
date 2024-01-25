import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { PDC_TEAMS, TFM_USER_TEAMS } from '../../../fixtures/teams';
import relativeURL from '../../relativeURL';

context('Login to tfm with specific roles', () => {
  const findOneUserByTeamId = (teamId) => USERS.find((user) => user?.teams?.includes(teamId));

  beforeEach(() => {
    pages.landingPage.visit();
  });

  const nonPdcTeams = Object.values(TFM_USER_TEAMS).filter((team) => !PDC_TEAMS[team]);
  nonPdcTeams.forEach((team) => {
    it(`should redirect to /deals after a login for users in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login(userInTeam);

      cy.url().should('eq', relativeURL('/deals'));
    });
  });

  const pdcTeams = Object.values(PDC_TEAMS);
  pdcTeams.forEach((team) => {
    it(`should redirect to /utilisation-reports after a login for users in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login(userInTeam);

      cy.url().should('eq', relativeURL('/utilisation-reports'));
    });
  });
});

import pages from '../../pages';
import USERS from '../../../../../e2e-fixtures/tfm-users.fixture';
import TEAMS from '../../../fixtures/teams';
import relativeURL from '../../relativeURL';

context('Login to tfm with specific roles', () => {
  const findOneUserByTeamId = (teamId) => USERS.find((user) => user?.teams?.includes(teamId));

  beforeEach(() => {
    pages.landingPage.visit();
  });

  const nonPdcTeams = Object.values(TEAMS).filter((team) => !team.id.includes('PDC'));
  nonPdcTeams.forEach((team) => {
    it(`should redirect to /deals after a login for users in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team.id);
      cy.login(userInTeam);

      cy.url().should('eq', relativeURL('/deals'));
    });
  });

  const pdcTeams = Object.values(TEAMS).filter((team) => team.id.includes('PDC'));
  pdcTeams.forEach((team) => {
    it(`should redirect to /utilisation-reports after a login for users in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team.id);
      cy.login(userInTeam);

      cy.url().should('eq', relativeURL('/utilisation-reports'));
    });
  });
});

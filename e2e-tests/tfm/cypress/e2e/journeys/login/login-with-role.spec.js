import pages from '../../pages';
import MOCK_USERS from '../../../fixtures/users';
import TEAMS from '../../../fixtures/teams';
import relativeURL from '../../relativeURL';

context('Login to tfm with specific roles', () => {
  beforeEach(() => {
    pages.landingPage.visit();
  });

  const pdcTeams = Object.entries(TEAMS).filter((team) => team.id.includes('PDC'));
  pdcTeams.forEach((team) => {
    it(`should redirect to /bank-reports after a login for users in '${team.id}' team`, () => {
      const userInTeam = MOCK_USERS.find((user) => user.teams.includes(team.id));
      cy.login(userInTeam);

      cy.url().should('eq', relativeURL('/bank-reports'));
    });
  });

  const nonPdcTeams = Object.entries(TEAMS).filter((team) => !team.id.includes('PDC'));
  nonPdcTeams.forEach((team) => {
    it(`should redirect to /deals after a login for users in '${team.id}' team`, () => {
      const userInTeam = MOCK_USERS.find((user) => user.teams.includes(team.id));
      cy.login(userInTeam);

      cy.url().should('eq', relativeURL('/deals'));
    });
  });
});

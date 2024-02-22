import USERS from '../../../fixtures/users';
import TEAMS from '../../../fixtures/teams';
import relativeURL from '../../relativeURL';

const findOneUserByTeamId = (teamId) => USERS.find((user) => user?.teams?.includes(teamId));

const NON_PDC_TEAMS = Object.values(TEAMS).filter((team) => !team.includes('PDC'));
const PDC_TEAMS = Object.values(TEAMS).filter((team) => team.includes('PDC'));

context('Login to tfm with specific roles', () => {
  NON_PDC_TEAMS.forEach((teamName) => {
    it(`should redirect to /deals after a login for users in '${teamName}' team`, () => {
      const userInTeam = findOneUserByTeamId(teamName);

      cy.login(userInTeam);

      cy.url().should('eq', relativeURL('/deals'));
    });
  });

  PDC_TEAMS.forEach((teamName) => {
    it(`should redirect to /utilisation-reports after a login for users in '${teamName}' team`, () => {
      const userInTeam = findOneUserByTeamId(teamName);

      cy.login(userInTeam);

      cy.url().should('eq', relativeURL('/utilisation-reports'));
    });
  });
});

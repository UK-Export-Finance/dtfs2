import USERS from '../../../fixtures/users';
import TEAMS from '../../../fixtures/teams';
import relativeURL from '../../relativeURL';

context('Login to tfm with specific roles', () => {
  const findOneUserByTeamId = (teamId) => USERS.find((user) => user?.teams?.includes(teamId));

  const nonPdcTeams = Object.values(TEAMS).filter((team) => !team.includes('PDC'));
  nonPdcTeams.forEach((team) => {
    it(`should redirect to /deals after a login for users in '${team}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login(userInTeam);

      cy.url().should('eq', relativeURL('/deals'));
    });
  });

  const pdcTeams = Object.values(TEAMS).filter((team) => team.includes('PDC'));
  pdcTeams.forEach((team) => {
    it(`should redirect to /utilisation-reports after a login for users in '${team}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login(userInTeam);

      cy.url().should('eq', relativeURL('/utilisation-reports'));
    });
  });
});

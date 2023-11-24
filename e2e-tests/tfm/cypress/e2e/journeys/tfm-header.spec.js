import pages from '../pages';
import { primaryNavigation } from '../partials';
import MOCK_USERS from '../../fixtures/users';
import TEAMS from '../../fixtures/teams';

context('Users see correct primary navigation items', () => {
  const findOneUserByTeamId = (teamId) => MOCK_USERS.find((user) => user.teams.some((team) => team.id === teamId));

  beforeEach(() => {
    pages.landingPage.visit();
  });

  it('should not show any of the nav items when a user is not logged in', () => {
    primaryNavigation.allDealsLink().should('not.exist');
    primaryNavigation.allFacilitiesLink().should('not.exist');
    primaryNavigation.bankReportsLink().should('not.exist');
  });

  const nonPdcTeams = Object.values(TEAMS).filter((team) => !team.id.includes('PDC'));
  nonPdcTeams.forEach((team) => {
    it(`should only show the 'All Deals' and 'All Facilities' navigation item for a user in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team.id);
      cy.login(userInTeam);

      primaryNavigation.allDealsLink().should('exist');
      primaryNavigation.allFacilitiesLink().should('exist');
      primaryNavigation.bankReportsLink().should('not.exist');
    });
  });

  const pdcTeams = Object.values(TEAMS).filter((team) => team.id.includes('PDC'));
  pdcTeams.forEach((team) => {
    it(`should show the 'All Deals', 'All Facilities' and 'Bank Reports' navigation item for a user in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team.id);
      cy.login(userInTeam);

      primaryNavigation.allDealsLink().should('exist');
      primaryNavigation.allFacilitiesLink().should('exist');
      primaryNavigation.bankReportsLink().should('exist');
    });
  });
});

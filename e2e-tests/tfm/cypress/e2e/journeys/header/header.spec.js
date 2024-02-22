import pages from '../../pages';
import { primaryNavigation } from '../../partials';
import USERS from '../../../fixtures/users';
import TEAMS from '../../../fixtures/teams';

context('Users see correct primary navigation items', () => {
  const findOneUserByTeamId = (teamId) => USERS.find((user) => user?.teams?.includes(teamId));

  beforeEach(() => {
    // TODO: After SSO user can't visit landingPage.
    // pages.landingPage.visit();
    pages.feedbackPage.visit();
  });

  it('should not show any of the nav items when a user is not logged in', () => {
    primaryNavigation.allDealsLink().should('not.exist');
    primaryNavigation.allFacilitiesLink().should('not.exist');
    primaryNavigation.bankReportsLink().should('not.exist');
  });

  const nonPdcTeams = Object.values(TEAMS).filter((team) => !team.includes('PDC'));
  nonPdcTeams.forEach((team) => {
    it(`should only show the 'All Deals' and 'All Facilities' navigation item for a user in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login(userInTeam);

      primaryNavigation.allDealsLink().should('exist');
      primaryNavigation.allFacilitiesLink().should('exist');
      primaryNavigation.bankReportsLink().should('not.exist');
    });
  });

  const pdcTeams = Object.values(TEAMS).filter((team) => team.includes('PDC'));
  pdcTeams.forEach((team) => {
    it(`should show the 'All Deals', 'All Facilities' and 'Bank Reports' navigation item for a user in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login(userInTeam);

      primaryNavigation.allDealsLink().should('exist');
      primaryNavigation.allFacilitiesLink().should('exist');
      primaryNavigation.bankReportsLink().should('exist');
    });
  });
});

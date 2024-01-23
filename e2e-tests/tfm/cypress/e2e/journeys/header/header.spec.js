import pages from '../../pages';
import { primaryNavigation } from '../../partials';
import USERS from '../../../fixtures/users';
import TEAMS from '../../../fixtures/teams';

context('Users see correct primary navigation items', () => {
  const findOneUserByTeamId = (teamId) => USERS.find((user) => user?.teams?.includes(teamId));

  beforeEach(() => {
    pages.landingPage.visit();
  });

  it('should not show any of the nav items when a user is not logged in', () => {
    primaryNavigation.allDealsLink().should('not.exist');
    primaryNavigation.allFacilitiesLink().should('not.exist');
    primaryNavigation.bankReportsLink().should('not.exist');
  });

  const nonPdcTeams = Object.values(TEAMS).filter((team) => !team.includes('PDC'));
  nonPdcTeams.forEach((team) => {
    it(`should only show the 'All Deals' and 'All Facilities' navigation items for a user in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login(userInTeam);

      primaryNavigation.allDealsLink().should('exist');
      primaryNavigation.allFacilitiesLink().should('exist');
      primaryNavigation.bankReportsLink().should('not.exist');
    });
  });

  const pdcTeams = Object.values(TEAMS).filter((team) => team.includes('PDC'));
  pdcTeams.forEach((team) => {
    it(`should show the 'Bank Reports' navigation item for a user in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login(userInTeam);

      primaryNavigation.allDealsLink().should('not.exist');
      primaryNavigation.allFacilitiesLink().should('not.exist');
      primaryNavigation.bankReportsLink().should('exist');
    });
  });

  it(`should show the 'All Deals', 'All Facilities' and 'Bank Reports' navigation items for a user in '${TEAMS.PIM.id}' and '${TEAMS.PDC_RECONCILE.id}' teams`, () => {
    const userInTeams = USERS.filter((user) => user.teams.includes(TEAMS.PIM.id)).find((user) => user.teams.includes(TEAMS.PDC_RECONCILE.id));
    cy.login(userInTeams);

    primaryNavigation.allDealsLink().should('exist');
    primaryNavigation.allFacilitiesLink().should('exist');
    primaryNavigation.bankReportsLink().should('exist');
  });
});

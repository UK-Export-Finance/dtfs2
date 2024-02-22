import pages from '../../pages';
import { primaryNavigation } from '../../partials';
import USERS from '../../../fixtures/users';
import { TFM_USER_TEAMS, PDC_TEAMS } from '../../../fixtures/teams';

context('Users see correct primary navigation items', () => {
  const findOneUserByTeamId = (teamId) => Object.values(USERS).find((user) => user?.teams?.includes(teamId));

  beforeEach(() => {
    pages.landingPage.visit();
  });

  it('should not show any of the nav items when a user is not logged in', () => {
    primaryNavigation.allDealsLink().should('not.exist');
    primaryNavigation.allFacilitiesLink().should('not.exist');
    primaryNavigation.bankReportsLink().should('not.exist');
  });

  const nonPdcTeams = Object.values(TFM_USER_TEAMS).filter((team) => !PDC_TEAMS[team]);
  nonPdcTeams.forEach((team) => {
    it(`should only show the 'All Deals' and 'All Facilities' navigation items for a user in '${team}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login(userInTeam);

      primaryNavigation.allDealsLink().should('exist');
      primaryNavigation.allFacilitiesLink().should('exist');
      primaryNavigation.bankReportsLink().should('not.exist');
    });
  });

  const pdcTeams = Object.values(PDC_TEAMS);
  pdcTeams.forEach((team) => {
    it(`should show the 'Bank Reports' navigation item for a user in '${team}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login(userInTeam);

      primaryNavigation.allDealsLink().should('not.exist');
      primaryNavigation.allFacilitiesLink().should('not.exist');
      primaryNavigation.bankReportsLink().should('exist');
    });
  });

  it(`should show the 'All Deals', 'All Facilities' and 'Bank Reports' navigation items for a user in '${TFM_USER_TEAMS.PIM}' and '${PDC_TEAMS.PDC_RECONCILE}' teams`, () => {
    const pimPdcReconcileUser = USERS.PIM_PDC_RECONCILE;
    cy.login(pimPdcReconcileUser);

    primaryNavigation.allDealsLink().should('exist');
    primaryNavigation.allFacilitiesLink().should('exist');
    primaryNavigation.bankReportsLink().should('exist');
  });
});

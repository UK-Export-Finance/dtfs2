import pages from '../../pages';
import { primaryNavigation } from '../../partials';
import USERS from '../../../fixtures/users';
import { TFM_USER_TEAMS, PDC_TEAMS as PDC_TEAMS_OBJECT } from '../../../fixtures/teams';

const findOneUserByTeamId = (teamId) => Object.values(USERS).find((user) => user?.teams?.includes(teamId));

const NON_PDC_TEAMS = Object.values(TFM_USER_TEAMS).filter((team) => !team.includes('PDC'));
const PDC_TEAMS = Object.values(PDC_TEAMS_OBJECT);

context('Users see correct primary navigation items', () => {
  beforeEach(() => {
    pages.feedbackPage.visit();
  });

  it('should not show any of the nav items when a user is not logged in', () => {
    primaryNavigation.allDealsLink().should('not.exist');
    primaryNavigation.allFacilitiesLink().should('not.exist');
    primaryNavigation.bankReportsLink().should('not.exist');
  });

  NON_PDC_TEAMS.forEach((team) => {
    it(`should only show the 'All Deals' and 'All Facilities' navigation item for a user in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login({ user: userInTeam });

      primaryNavigation.allDealsLink().should('exist');
      primaryNavigation.allFacilitiesLink().should('exist');
      primaryNavigation.bankReportsLink().should('not.exist');
    });
  });

  PDC_TEAMS.forEach((team) => {
    it(`should show the 'Bank Reports' navigation item for a user in '${team.id}' team`, () => {
      const userInTeam = findOneUserByTeamId(team);
      cy.login({ user: userInTeam });

      primaryNavigation.allDealsLink().should('not.exist');
      primaryNavigation.allFacilitiesLink().should('not.exist');
      primaryNavigation.bankReportsLink().should('exist');
    });
  });

  it(`should show the 'All Deals', 'All Facilities' and 'Bank Reports' navigation items for a user in '${TFM_USER_TEAMS.PIM}' and '${PDC_TEAMS.PDC_RECONCILE}' teams`, () => {
    const pimPdcReconcileUser = USERS.PIM_PDC_RECONCILE;
    cy.login({ user: pimPdcReconcileUser });

    primaryNavigation.allDealsLink().should('exist');
    primaryNavigation.allFacilitiesLink().should('exist');
    primaryNavigation.bankReportsLink().should('exist');
  });
});

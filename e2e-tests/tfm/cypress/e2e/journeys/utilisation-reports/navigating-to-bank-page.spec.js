import pages from '../../pages';
import USERS from '../../../fixtures/users';
import TEAMS from '../../../fixtures/teams';

context('PDC users can route to the payments page for a bank', () => {
  const pdcReconcileUser = USERS.find((user) => user.teams.includes(TEAMS.PDC_RECONCILE.id));

  // beforeAll(() => {
  //   Insert banks (2 visible, 1 not)
  //   Insert reports? Not really needed but might be worthwhile so I don't need to mock date
  // });

  beforeEach(() => {
    pages.landingPage.visit();
    cy.login(pdcReconcileUser);
  });

  it('should show the banks which', () => {

  });
});

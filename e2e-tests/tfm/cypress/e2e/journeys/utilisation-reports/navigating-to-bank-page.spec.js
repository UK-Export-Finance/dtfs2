import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { PDC_TEAMS } from '../../../fixtures/teams';

context('PDC users can route to the payments page for a bank', () => {
  const pdcReconcileUser = USERS.find((user) => user.teams.includes(PDC_TEAMS.PDC_RECONCILE));
  let banks;

  beforeEach(() => {
    cy.getAllBanks().then((getAllBanksResult) => {
      banks = getAllBanksResult.map(({ id, isVisibleInTfmUtilisationReports }) => ({
        id,
        isVisibleInTfmUtilisationReports,
      }));
    });

    pages.landingPage.visit();
    cy.login(pdcReconcileUser);
  });

  it('should (not) render a table row for all the bank ids which are (not) visible', () => {
    const submissionMonth = '2024-01';
    pages.utilisationReportPage.heading(submissionMonth).should('exist');
    banks.forEach((bank) => {
      const condition = bank.isVisibleInTfmUtilisationReports || bank.isVisibleInTfmUtilisationReports === undefined ? 'exist' : 'not.exist';
      pages.utilisationReportPage.tableRowSelector(bank.id, submissionMonth).should(condition);
    });
  });
});

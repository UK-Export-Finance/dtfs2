import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { PDC_TEAMS } from '../../../fixtures/teams';

context('PDC_READ users can route to the payments page for a bank', () => {
  const pdcReconcileUser = Object.values(USERS).find((user) => user.teams.includes(PDC_TEAMS.PDC_RECONCILE));
  const banksAlias = 'banks';

  before(() => {
    cy.getAllBanks().then((getAllBanksResult) => {
      const banks = getAllBanksResult.map(({ id, isVisibleInTfmUtilisationReports }) => ({
        id,
        isVisibleInTfmUtilisationReports,
      }));
      cy.wrap(banks).as(banksAlias);
    });
  });

  beforeEach(() => {
    pages.landingPage.visit();
    cy.login(pdcReconcileUser);
  });

  it('should (not) render a table row for all the bank ids which are (not) visible', () => {
    const submissionMonth = '2024-01';
    pages.utilisationReportPage.heading(submissionMonth).should('exist');

    cy.get(`@${banksAlias}`).each((bank) => {
      const condition = bank.isVisibleInTfmUtilisationReports ? 'exist' : 'not.exist';
      pages.utilisationReportPage.tableRowSelector(bank.id, submissionMonth).should(condition);
    });
  });

  it('should render previous open reports', () => {
    // TODO Insert open reports
  });
});

import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { getCurrentISOSubmissionMonth } from '../../../support/utils/dateFuncs';

context('PDC_READ users can route to the payments page for a bank', () => {
  const pdcReconcileUser = USERS.PDC_RECONCILE;
  const banksAlias = 'banks';
  const submissionMonth = getCurrentISOSubmissionMonth();

  before(() => {
    cy.getAllBanks().then((getAllBanksResult) => {
      cy.wrap(getAllBanksResult).as(banksAlias);
    });
  });

  beforeEach(() => {
    pages.landingPage.visit();
    cy.login(pdcReconcileUser);
  });

  it('should (not) render a table row for all the bank ids which are (not) visible', () => {
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

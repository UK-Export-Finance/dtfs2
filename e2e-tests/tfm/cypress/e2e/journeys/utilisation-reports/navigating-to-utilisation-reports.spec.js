import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { getCurrentISOSubmissionMonth } from '../../../support/utils/dateFuncs';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, createMockUtilisationReportDetails } from '../../../fixtures/create-mock-utilisation-report-details';
import { NODE_TASKS } from '../../../../../e2e-fixtures';

context('PDC_READ users can route to the payments page for a bank', () => {
  const pdcReconcileUser = USERS.PDC_RECONCILE;
  const utilisationReportDetailsAlias = 'utilisationReportDetailsAlias';
  const submissionMonth = getCurrentISOSubmissionMonth();
  const status = UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;

  beforeEach(() => {
    const visibleBanks = [];
    cy.getAllBanks().then((getAllBanksResult) => {
      getAllBanksResult
        .filter((bank) => bank.isVisibleInTfmUtilisationReports)
        .forEach((visibleBank) => {
          visibleBanks.push(visibleBank);
        });
      cy.wrap(visibleBanks).its('length').should('be.gte', 1);
    });

    const mockUtilisationReportDetailsWithoutId = [];
    cy.wrap(visibleBanks).each((bank) => {
      const mockDetailsWithoutId = createMockUtilisationReportDetails({
        bank: { id: bank.id, name: bank.name },
        status,
        submissionMonth,
      });
      mockUtilisationReportDetailsWithoutId.push(mockDetailsWithoutId);
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORT_DETAILS_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORT_DETAILS_INTO_DB, mockUtilisationReportDetailsWithoutId).then((insertManyResult) => {
      const { insertedIds } = insertManyResult;

      const utilisationReportDetailsWithId = mockUtilisationReportDetailsWithoutId.map((reportDetailsWithoutId, index) => {
        const _id = insertedIds[index];
        return { ...reportDetailsWithoutId, _id };
      });

      cy.wrap(utilisationReportDetailsWithId).as(utilisationReportDetailsAlias);
    });

    pages.landingPage.visit();
    cy.login(pdcReconcileUser);

    pages.utilisationReportsPage.visit();
  });

  it('should (not) render a table row for all the bank ids which are (not) visible', () => {
    pages.utilisationReportPage.heading(submissionMonth).should('exist');

    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReportDetails) => {
      const { bank } = utilisationReportDetails;
      pages.utilisationReportsPage.tableRowSelector(bank.id, submissionMonth).should('exist');
    });
  });

  it('should show the problem with service page if there are no reports in the database', () => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORT_DETAILS_FROM_DB);

    pages.utilisationReportsPage.visit();

    // Expect problem with service to appear
    // TODO Insert open reports
  });
});

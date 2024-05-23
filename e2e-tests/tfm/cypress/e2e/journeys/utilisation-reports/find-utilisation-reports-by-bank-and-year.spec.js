import { UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { NODE_TASKS } from '../../../../../e2e-fixtures';

context('PDC_RECONCILE users can search for reports by bank and year', () => {
  const allBanksAlias = 'allBanksAlias';

  beforeEach(() => {
    const visibleBanks = [];
    cy.task(NODE_TASKS.GET_ALL_BANKS).then((getAllBanksResult) => {
      cy.wrap(getAllBanksResult).as(allBanksAlias);

      getAllBanksResult
        .filter((bank) => bank.isVisibleInTfmUtilisationReports)
        .forEach((visibleBank) => {
          visibleBanks.push(visibleBank);
        });
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    cy.wrap(visibleBanks[0]).each((bank) => {
      const reportPeriod = {
        start: {
          month: 10,
          year: 2024,
        },
        end: {
          month: 10,
          year: 2024,
        },
      };

      const mockPendingReconciliationUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(
        UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
      )
        .withId(bank.id)
        .withBankId(bank.id)
        .withReportPeriod(reportPeriod)
        .build();
      const mockNotReceivedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED)
        .withId(bank.id + 1)
        .withBankId(bank.id)
        .withReportPeriod(reportPeriod)
        .build();
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockPendingReconciliationUtilisationReport, mockNotReceivedUtilisationReport]);
    });

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    pages.searchUtilisationReportsFormPage.visit();
  });

  it('should render a table for the reports which have been submitted', () => {
    pages.searchUtilisationReportsFormPage.heading().should('exist');

    pages.searchUtilisationReportsFormPage.bankRadioButton('956').click();
    pages.searchUtilisationReportsFormPage.yearInput().type('2024');
    pages.searchUtilisationReportsFormPage.continueButton().click();

    pages.searchUtilisationReportsResultsPage.heading().should('exist');
    pages.searchUtilisationReportsResultsPage.table().should('exist');
  });

  it('should render the "No reports found" text for the banks with no reports submitted', () => {
    pages.searchUtilisationReportsFormPage.heading().should('exist');

    pages.searchUtilisationReportsFormPage.bankRadioButton('953').click();
    pages.searchUtilisationReportsFormPage.yearInput().type('2024');
    pages.searchUtilisationReportsFormPage.continueButton().click();

    pages.searchUtilisationReportsResultsPage.heading().should('exist');
    pages.searchUtilisationReportsResultsPage.noReportsText().should('exist');
  });
});

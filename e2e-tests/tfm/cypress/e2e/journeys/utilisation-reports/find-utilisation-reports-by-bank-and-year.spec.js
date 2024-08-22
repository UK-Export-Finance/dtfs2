import { UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { NODE_TASKS } from '../../../../../e2e-fixtures';

context('PDC_RECONCILE users can search for reports by bank and year', () => {
  const allBanksAlias = 'allBanksAlias';
  const BANK_WITH_REPORTS_ID = '956';
  const BANK_WITHOUT_REPORTS_ID = '953';

  before(() => {
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

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

    cy.wrap(visibleBanks).each((bank) => {
      if (bank.id === BANK_WITH_REPORTS_ID) {
        const getReportPeriod = (month) => {
          return {
            start: {
              month,
              year: 2024,
            },
            end: {
              month,
              year: 2024,
            },
          };
        };

        const mockPendingReconciliationUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(
          UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
        )
          .withId('1')
          .withBankId(bank.id)
          .withReportPeriod(getReportPeriod(10))
          .build();
        const mockNotReceivedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED)
          .withId('2')
          .withBankId(bank.id)
          .withReportPeriod(getReportPeriod(11))
          .build();
        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockPendingReconciliationUtilisationReport, mockNotReceivedUtilisationReport]);
      }
    });

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    pages.searchUtilisationReportsFormPage.visit();
  });

  it('should render a table for the reports which have been submitted', () => {
    pages.searchUtilisationReportsFormPage.heading().should('exist');

    pages.searchUtilisationReportsFormPage.bankRadioButton(BANK_WITH_REPORTS_ID).click();
    pages.searchUtilisationReportsFormPage.yearInput().type('2024');
    pages.searchUtilisationReportsFormPage.continueButton().click();

    pages.searchUtilisationReportsResultsPage.heading().should('exist');
    pages.searchUtilisationReportsResultsPage.table().should('exist');
  });

  it('should render the "No reports found" text for the banks with no reports submitted', () => {
    pages.searchUtilisationReportsFormPage.heading().should('exist');

    pages.searchUtilisationReportsFormPage.bankRadioButton(BANK_WITHOUT_REPORTS_ID).click();
    pages.searchUtilisationReportsFormPage.yearInput().type('2024');
    pages.searchUtilisationReportsFormPage.continueButton().click();

    pages.searchUtilisationReportsResultsPage.heading().should('exist');
    pages.searchUtilisationReportsResultsPage.noReportsText().should('exist');
  });
});

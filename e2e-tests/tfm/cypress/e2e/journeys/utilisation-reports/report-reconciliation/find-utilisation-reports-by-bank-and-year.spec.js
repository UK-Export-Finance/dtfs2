import { UtilisationReportEntityMockBuilder } from "@ukef/dtfs2-common/test-helpers";
import { PENDING_RECONCILIATION, REPORT_NOT_RECEIVED } from '@ukef/dtfs2-common';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';

context('PDC_RECONCILE users can search for reports by bank and year', () => {
  const allBanksAlias = 'allBanksAlias';
  const BANK_WITH_REPORTS_ID = '9';
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

        const mockPendingReconciliationUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
          .withId('1')
          .withBankId(bank.id)
          .withReportPeriod(getReportPeriod(10))
          .build();
        const mockNotReceivedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED)
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
    cy.keyboardInput(pages.searchUtilisationReportsFormPage.yearInput(), '2024');
    cy.clickContinueButton();

    pages.searchUtilisationReportsResultsPage.heading().should('exist');
    pages.searchUtilisationReportsResultsPage.table().should('exist');
  });

  it('should render the "No reports found" text for the banks with no reports submitted', () => {
    pages.searchUtilisationReportsFormPage.heading().should('exist');

    pages.searchUtilisationReportsFormPage.bankRadioButton(BANK_WITHOUT_REPORTS_ID).click();
    cy.keyboardInput(pages.searchUtilisationReportsFormPage.yearInput(), '2024');
    cy.clickContinueButton();

    pages.searchUtilisationReportsResultsPage.heading().should('exist');
    pages.searchUtilisationReportsResultsPage.noReportsText().should('exist');
  });

  it('should NOT disable the year input  when no bank is selected', () => {
    pages.searchUtilisationReportsFormPage.heading().should('exist');

    pages.searchUtilisationReportsFormPage.yearInput().should('not.be.disabled');
    pages.searchUtilisationReportsFormPage.yearInput().should('be.enabled');
  });

  it('should NOT have any dropdown options when no bank is selected', () => {
    pages.searchUtilisationReportsFormPage.heading().should('exist');

    pages.searchUtilisationReportsFormPage.yearInputDropdownId().should('equal', '');
  });

  it('should display the dropdown for banks which have reports and should not display anything for banks without reports', () => {
    const getDatalistIdForBankId = (bankId) => `datalist--bankId-${bankId}`;

    pages.searchUtilisationReportsFormPage.heading().should('exist');

    pages.searchUtilisationReportsFormPage.yearInputDropdownId().should('equal', '');

    pages.searchUtilisationReportsFormPage.bankRadioButton(BANK_WITHOUT_REPORTS_ID).click();
    pages.searchUtilisationReportsFormPage
      .yearInputDropdownId()
      .should('equal', getDatalistIdForBankId(BANK_WITHOUT_REPORTS_ID))
      .then((datalistId) => {
        // Banks with no reports should have no datalist rendered
        cy.get(`datalist#${datalistId}`).should('not.exist');
      });

    pages.searchUtilisationReportsFormPage.bankRadioButton(BANK_WITH_REPORTS_ID).click();
    pages.searchUtilisationReportsFormPage
      .yearInputDropdownId()
      .should('equal', getDatalistIdForBankId(BANK_WITH_REPORTS_ID))
      .then((datalistId) => {
        const datalistSelector = `datalist#${datalistId}`;
        cy.get(datalistSelector).should('exist');
        cy.get(`${datalistSelector} > option`).should('have.length', 1);
        cy.get(`${datalistSelector} option`).invoke('attr', 'value').should('equal', '2024');
      });
  });
});

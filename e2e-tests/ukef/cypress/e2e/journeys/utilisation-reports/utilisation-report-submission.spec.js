import { REPORT_NOT_RECEIVED, UtilisationReportEntityMockBuilder, getPreviousReportPeriodForBankScheduleByMonth, toIsoMonthStamp } from '@ukef/dtfs2-common';

import relative from '../../relativeURL';
import { NODE_TASKS, PDC_RECONCILE, TFM_URL } from '../../../../../e2e-fixtures';

import portalPages from '../../../../../portal/cypress/e2e/pages';
import tfmPages from '../../../../../tfm/cypress/e2e/pages';

import MOCK_USERS from '../../../../../e2e-fixtures/portal-users.fixture';
import { tfmFacilityForReport } from '../../../fixtures/tfm-facility';
import { february2023ExpectedValues } from '../../../fixtures/february-2023-expected-values';

const { BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

context('Portal to TFM utilisation report submission', () => {
  const today = new Date();
  const submissionMonthStamp = toIsoMonthStamp(today);

  before(() => {
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [tfmFacilityForReport]);
  });

  beforeEach(() => {
    const visibleBanks = [];
    cy.task(NODE_TASKS.GET_ALL_BANKS).then((getAllBanksResult) => {
      getAllBanksResult
        .filter((bank) => bank.isVisibleInTfmUtilisationReports)
        .forEach((visibleBank) => {
          visibleBanks.push(visibleBank);
        });
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    // Insert a REPORT_NOT_RECEIVED report for each visible bank for their latest reporting period
    cy.wrap(visibleBanks).each((bank) => {
      const reportPeriod = getPreviousReportPeriodForBankScheduleByMonth(bank.utilisationReportPeriodSchedule, submissionMonthStamp);
      const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED)
        .withId(bank.id)
        .withBankId(bank.id)
        .withReportPeriod(reportPeriod)
        .build();
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockUtilisationReport]);
    });

    // Insert a REPORT_NOT_RECEIVED report for February 2023 for the bank the portal user belongs to
    const notReceivedFebruary2023Report = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED)
      .withId(BANK1_PAYMENT_REPORT_OFFICER1.bank.id + 10000000)
      .withBankId(BANK1_PAYMENT_REPORT_OFFICER1.bank.id)
      .withReportPeriod({ start: { month: 2, year: 2023 }, end: { month: 2, year: 2023 } })
      .build();
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [notReceivedFebruary2023Report]);

    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
  });

  /**
   * Asserts the values in a given row of the premium payments table match the expected
   * values from the report as defined in february2023ExpectedValues
   * @param {number} premiumPaymentsRowIndex - The index of the row of the premium payments table
   * @param {object} expectedValues - The expected values to be found in the row
   */
  const assertPremiumPaymentsTableRowContainsExpectedValues = (premiumPaymentsRowIndex, expectedValues) => {
    cy.assertText(
      tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.facilityIdByRowIndex(premiumPaymentsRowIndex),
      expectedValues.facilityId,
    );
    cy.assertText(
      tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.exporterIdByRowIndex(premiumPaymentsRowIndex),
      expectedValues.exporter,
    );
    cy.assertText(
      tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.reportedFeesByRowIndex(premiumPaymentsRowIndex),
      expectedValues.reportedFees,
    );
    cy.assertText(
      tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.reportedPaymentsByRowIndex(premiumPaymentsRowIndex),
      expectedValues.reportedPayments,
    );
    cy.assertText(
      tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.totalReportedPaymentsByRowIndex(premiumPaymentsRowIndex),
      expectedValues.reportedPayments,
    );
  };

  /**
   * Asserts the values in a given row of the utilisation table match the expected
   * values from the report as defined in february2023ExpectedValues
   * @param {number} utilisationTableRowIndex - The index of the row of utilisation table
   * @param {object} expectedValues - The expected values to be found in the row
   */
  const assertUtilisationTableRowContainsExpectedValues = (utilisationTableRowIndex, expectedValues) => {
    tfmPages.utilisationReportPage.utilisationTab.table.rowByIndex(utilisationTableRowIndex).within(() => {
      cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.facilityId(), expectedValues.facilityId);
      cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.exporter(), expectedValues.exporter);
      cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.feesPayable(), expectedValues.reportedFees);
      cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.feesAccrued(), expectedValues.feesAccrued);
      cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.utilisation(), expectedValues.utilisation);
    });
  };

  const testFebruary2023ReportUploadWithFileType = (filetype) => {
    const filename = filetype === 'csv' ? 'valid-utilisation-report-February_2023_monthly.csv' : 'valid-utilisation-report-February_2023_monthly.xlsx';

    //---------------------------------------------------------------------------------
    // Portal payment report officer submits utilisation report
    //---------------------------------------------------------------------------------
    cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
    cy.visit(relative('/utilisation-report-upload'));

    portalPages.utilisationReportUpload.utilisationReportFileInput().attachFile(filename);
    cy.clickContinueButton();
    portalPages.confirmAndSend.confirmAndSendButton().click();

    //---------------------------------------------------------------------------------
    // PDC_RECONCILE user can login to TFM and view the data from the submitted report
    //---------------------------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.visit(TFM_URL);

    cy.tfmLogin(PDC_RECONCILE);
    cy.url().should('eq', `${TFM_URL}/utilisation-reports`);

    tfmPages.utilisationReportsSummaryPage.reportLink(BANK1_PAYMENT_REPORT_OFFICER1.bank.id, '2023-03').click();

    /**
     * Each line of the report will have an entry in the premium payments table,
     * but they will not be in the same order so first we find the index within
     * the premium payments tab table for each of the report rows.
     */
    tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.rows().each(($row, index) => {
      cy.wrap($row)
        .find('[data-cy="exporter"]')
        .eq(0)
        .then(($cell) => {
          if ($cell.text().trim() === february2023ExpectedValues.firstReportRow.exporter) {
            cy.wrap(index).as('firstReportRowPremiumPaymentsTableIndex');
          }

          if ($cell.text().trim() === february2023ExpectedValues.secondReportRow.exporter) {
            cy.wrap(index).as('secondReportRowPremiumPaymentsTableIndex');
          }

          if ($cell.text().trim() === february2023ExpectedValues.thirdReportRow.exporter) {
            cy.wrap(index).as('thirdReportRowPremiumPaymentsTableIndex');
          }
        });
    });

    // Assert first line of report is displayed in the premium payments table
    cy.get('@firstReportRowPremiumPaymentsTableIndex').then((index) => {
      assertPremiumPaymentsTableRowContainsExpectedValues(index, february2023ExpectedValues.firstReportRow);
    });

    // Assert second line of report is displayed in the premium payments table
    cy.get('@secondReportRowPremiumPaymentsTableIndex').then((index) => {
      assertPremiumPaymentsTableRowContainsExpectedValues(index, february2023ExpectedValues.secondReportRow);
    });

    // Assert third line of report is displayed in the premium payments table
    cy.get('@thirdReportRowPremiumPaymentsTableIndex').then((index) => {
      assertPremiumPaymentsTableRowContainsExpectedValues(index, february2023ExpectedValues.thirdReportRow);
    });

    tfmPages.utilisationReportPage.utilisationTabLink().click();

    /**
     * Each line of the report will have an entry in the utilisation tab table,
     * but they will not be in the same order so first we find the index within
     * the utilisation tab table for each of the report rows.
     */
    tfmPages.utilisationReportPage.utilisationTab.table.rows().each(($row, index) => {
      cy.wrap($row)
        .find('[data-cy="exporter"]')
        .eq(0)
        .then(($cell) => {
          if ($cell.text().trim() === february2023ExpectedValues.firstReportRow.exporter) {
            cy.wrap(index).as('firstReportRowUtilisationTableIndex');
          }

          if ($cell.text().trim() === february2023ExpectedValues.secondReportRow.exporter) {
            cy.wrap(index).as('secondReportRowUtilisationTableIndex');
          }

          if ($cell.text().trim() === february2023ExpectedValues.thirdReportRow.exporter) {
            cy.wrap(index).as('thirdReportRowUtilisationTableIndex');
          }
        });
    });

    // Assert first line of report is displayed in the utilisation table
    cy.get('@firstReportRowUtilisationTableIndex').then((index) => {
      assertUtilisationTableRowContainsExpectedValues(index, february2023ExpectedValues.firstReportRow);
    });

    // Assert second line of report is displayed in the utilisation table
    cy.get('@secondReportRowUtilisationTableIndex').then((index) => {
      assertUtilisationTableRowContainsExpectedValues(index, february2023ExpectedValues.secondReportRow);
    });

    // Assert third line of report is displayed in the utilisation table
    cy.get('@thirdReportRowUtilisationTableIndex').then((index) => {
      assertUtilisationTableRowContainsExpectedValues(index, february2023ExpectedValues.thirdReportRow);
    });
  };

  it('Bank uploads utilisation report to Portal and report data is displayed correctly in TFM to PDC_RECONCILE user - csv', () => {
    testFebruary2023ReportUploadWithFileType('csv');
  });

  it('Bank uploads utilisation report to Portal and report data is displayed correctly in TFM to PDC_RECONCILE user - xlsx', () => {
    testFebruary2023ReportUploadWithFileType('xlsx');
  });
});

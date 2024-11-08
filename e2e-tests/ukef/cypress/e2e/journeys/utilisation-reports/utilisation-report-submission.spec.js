import {
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  getPreviousReportPeriodForBankScheduleByMonth,
  toIsoMonthStamp,
} from '@ukef/dtfs2-common';

import relative from '../../relativeURL';
import { NODE_TASKS, PDC_RECONCILE, TFM_URL } from '../../../../../e2e-fixtures';

import portalPages from '../../../../../portal/cypress/e2e/pages';
import tfmPages from '../../../../../tfm/cypress/e2e/pages';

import MOCK_USERS from '../../../../../e2e-fixtures/portal-users.fixture';
import { tfmFacilityForReport } from '../../../fixtures/tfm-facility';

const { BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

context('Portal to TFM utilisation report submission', () => {
  const today = new Date();
  const submissionMonthStamp = toIsoMonthStamp(today);

  /**
   * These values need to be kept in line with the values in the file
   * 'valid-utilisation-report-February_2023_monthly.xlsx'
   * in the features folder as that is the file that is uploaded in this journey.
   */
  const expectedParsedReportValues = {
    firstReportRow: {
      facilityId: '20001371',
      exporter: 'Exporter 1',
      utilisation: '761,579.37',
      /**
       * Fees paid to ukef for the period currency followed by fees paid to ukef for the period
       */
      reportedFees: 'GBP 123.00',
      /**
       * No payment currency provided so this is the same as reported fees.
       */
      reportedPayments: 'GBP 123.00',
      /**
       * No total fees accrued for the period currency provided so this takes the value:
       * base currency followed by total fees accrued for the period.
       */
      feesAccrued: 'GBP 123.00',
    },
    secondReportRow: {
      facilityId: '20001371',
      exporter: 'Exporter 2',
      utilisation: '761,579.37',
      /**
       * Fees paid to ukef for the period currency followed by fees paid to ukef for the period.
       */
      reportedFees: 'GBP 243.00',
      /**
       * The payment currency is the same as the fees paid to ukef for the period currency,
       * so the reported payments match the reported fees.
       */
      reportedPayments: 'GBP 243.00',
      /**
       * Total fees accrued for the period currency followed by total fees accrued for the period.
       */
      feesAccrued: 'GBP 150.00',
    },
    thirdReportRow: {
      facilityId: '20001371',
      exporter: 'Potato exporter',
      utilisation: '761,579.37',
      /**
       * Fees paid to ukef for the period currency followed by fees paid to ukef for the period.
       */
      reportedFees: 'EUR 45.00',
      /**
       * Payment currency is in GBP which is different to the fees paid to UKEF currency.
       * The payment currency exchange rate is 1.17.
       * So the reported payments = fees paid to ukef for the period / payment currency exchange rate
       *                          = 45 / 1.17
       *                          = 38.46
       */
      reportedPayments: 'GBP 38.46',
      /**
       * Total fees accrued for the period currency followed by total fees accrued for the period.
       */
      feesAccrued: 'GBP 45.00',
    },
  };

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
      const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED)
        .withId(bank.id)
        .withBankId(bank.id)
        .withReportPeriod(reportPeriod)
        .build();
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockUtilisationReport]);
    });

    // Insert a NOT_RECEIVED report for February 2023 for the bank the portal user belongs to
    const notReceivedFebruary2023Report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED)
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

  it('Bank uploads utilisation report to Portal and report data is displayed correctly in TFM to PDC_RECONCILE user', () => {
    //---------------------------------------------------------------------------------
    // Portal payment report officer submits utilisation report
    //---------------------------------------------------------------------------------
    cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
    cy.visit(relative('/utilisation-report-upload'));

    portalPages.utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report-February_2023_monthly.xlsx');
    cy.clickContinueButton();
    portalPages.confirmAndSend.confirmAndSendButton().click();

    //---------------------------------------------------------------------------------
    // PDC_RECONCILE user can login to TFM and view the data from the submitted report
    //---------------------------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

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
          if ($cell.text().trim() === expectedParsedReportValues.firstReportRow.exporter) {
            cy.wrap(index).as('firstReportRowPremiumPaymentsTableIndex');
          }

          if ($cell.text().trim() === expectedParsedReportValues.secondReportRow.exporter) {
            cy.wrap(index).as('secondReportRowPremiumPaymentsTableIndex');
          }

          if ($cell.text().trim() === expectedParsedReportValues.thirdReportRow.exporter) {
            cy.wrap(index).as('thirdReportRowPremiumPaymentsTableIndex');
          }
        });
    });

    // Assert first line of report is displayed in the premium payments table
    cy.get('@firstReportRowPremiumPaymentsTableIndex').then((index) => {
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.facilityIdByRowIndex(index),
        expectedParsedReportValues.firstReportRow.facilityId,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.exporterIdByRowIndex(index),
        expectedParsedReportValues.firstReportRow.exporter,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.reportedFeesByRowIndex(index),
        expectedParsedReportValues.firstReportRow.reportedFees,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.reportedPaymentsByRowIndex(index),
        expectedParsedReportValues.firstReportRow.reportedPayments,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.totalReportedPaymentsByRowIndex(index),
        expectedParsedReportValues.firstReportRow.reportedPayments,
      );
    });

    // Assert second line of report is displayed in the premium payments table
    cy.get('@secondReportRowPremiumPaymentsTableIndex').then((index) => {
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.facilityIdByRowIndex(index),
        expectedParsedReportValues.secondReportRow.facilityId,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.exporterIdByRowIndex(index),
        expectedParsedReportValues.secondReportRow.exporter,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.reportedFeesByRowIndex(index),
        expectedParsedReportValues.secondReportRow.reportedFees,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.reportedPaymentsByRowIndex(index),
        expectedParsedReportValues.secondReportRow.reportedPayments,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.totalReportedPaymentsByRowIndex(index),
        expectedParsedReportValues.secondReportRow.reportedPayments,
      );
    });

    // Assert third line of report is displayed in the premium payments table
    cy.get('@thirdReportRowPremiumPaymentsTableIndex').then((index) => {
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.facilityIdByRowIndex(index),
        expectedParsedReportValues.thirdReportRow.facilityId,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.exporterIdByRowIndex(index),
        expectedParsedReportValues.thirdReportRow.exporter,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.reportedFeesByRowIndex(index),
        expectedParsedReportValues.thirdReportRow.reportedFees,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.reportedPaymentsByRowIndex(index),
        expectedParsedReportValues.thirdReportRow.reportedPayments,
      );
      cy.assertText(
        tfmPages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.totalReportedPaymentsByRowIndex(index),
        expectedParsedReportValues.thirdReportRow.reportedPayments,
      );
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
          if ($cell.text().trim() === expectedParsedReportValues.firstReportRow.exporter) {
            cy.wrap(index).as('firstReportRowUtilisationTableIndex');
          }

          if ($cell.text().trim() === expectedParsedReportValues.secondReportRow.exporter) {
            cy.wrap(index).as('secondReportRowUtilisationTableIndex');
          }

          if ($cell.text().trim() === expectedParsedReportValues.thirdReportRow.exporter) {
            cy.wrap(index).as('thirdReportRowUtilisationTableIndex');
          }
        });
    });

    // Assert first line of report is displayed in the utilisation table
    cy.get('@firstReportRowUtilisationTableIndex').then((index) => {
      tfmPages.utilisationReportPage.utilisationTab.table.rowByIndex(index).within(() => {
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.facilityId(), expectedParsedReportValues.firstReportRow.facilityId);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.exporter(), expectedParsedReportValues.firstReportRow.exporter);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.feesPayable(), expectedParsedReportValues.firstReportRow.reportedFees);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.feesAccrued(), expectedParsedReportValues.firstReportRow.feesAccrued);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.utilisation(), expectedParsedReportValues.firstReportRow.utilisation);
      });
    });

    // Assert second line of report is displayed in the utilisation table
    cy.get('@secondReportRowUtilisationTableIndex').then((index) => {
      tfmPages.utilisationReportPage.utilisationTab.table.rowByIndex(index).within(() => {
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.facilityId(), expectedParsedReportValues.secondReportRow.facilityId);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.exporter(), expectedParsedReportValues.secondReportRow.exporter);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.feesPayable(), expectedParsedReportValues.secondReportRow.reportedFees);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.feesAccrued(), expectedParsedReportValues.secondReportRow.feesAccrued);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.utilisation(), expectedParsedReportValues.secondReportRow.utilisation);
      });
    });

    // Assert third line of report is displayed in the utilisation table
    cy.get('@thirdReportRowUtilisationTableIndex').then((index) => {
      tfmPages.utilisationReportPage.utilisationTab.table.rowByIndex(index).within(() => {
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.facilityId(), expectedParsedReportValues.thirdReportRow.facilityId);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.exporter(), expectedParsedReportValues.thirdReportRow.exporter);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.feesPayable(), expectedParsedReportValues.thirdReportRow.reportedFees);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.feesAccrued(), expectedParsedReportValues.thirdReportRow.feesAccrued);
        cy.assertText(tfmPages.utilisationReportPage.utilisationTab.table.utilisation(), expectedParsedReportValues.thirdReportRow.utilisation);
      });
    });
  });
});

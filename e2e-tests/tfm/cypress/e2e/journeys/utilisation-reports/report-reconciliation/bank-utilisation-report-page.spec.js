import {
  FeeRecordEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
  getFormattedReportPeriodWithLongMonth,
  FEE_RECORD_STATUS,
  PENDING_RECONCILIATION,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

const { utilisationReportPage } = pages;

context('Bank utilisation report page', () => {
  const bankId = '961';
  const reportId = 1;
  let bankName;

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();
  const feeRecordAtToDoStatus = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build();

  const reportPeriodString = getFormattedReportPeriodWithLongMonth(report.reportPeriod);

  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordAtToDoStatus]);

    cy.task(NODE_TASKS.GET_ALL_BANKS).then((getAllBanksResult) => {
      const reportBank = getAllBanksResult.filter((bank) => bank.id === report.bankId);
      bankName = reportBank[0].name;
    });

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([feeRecordAtToDoStatus]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
  });

  describe(`when navigating to the page as ${USERS.PDC_RECONCILE}`, () => {
    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    it('should display the page heading and date', () => {
      cy.assertText(utilisationReportPage.heading(), bankName);

      cy.assertText(utilisationReportPage.reportPeriodHeading(), reportPeriodString);
    });

    it('should display the correct tabs', () => {
      cy.assertUrl(utilisationReportPage.tabs.premiumPayments(), '#premium-payments', 'Premium payments');
      cy.assertUrl(utilisationReportPage.tabs.keyingSheet(), '#keying-sheet', 'Keying sheet');
      cy.assertUrl(utilisationReportPage.tabs.paymentDetails(), '#payment-details', 'Payment details');
      cy.assertUrl(utilisationReportPage.tabs.utilisation(), '#utilisation', 'Utilisation');
    });

    it('should display the correct text', () => {
      cy.assertText(
        utilisationReportPage.tabs.premiumPaymentsContent.howToAddPaymentsText(),
        `Received payments are entered against reported fees through selection and then selection of the 'Add a payment' button.`,
      );

      cy.assertText(
        utilisationReportPage.tabs.premiumPaymentsContent.howToGenerateKeyingDataText(),
        `When payments show as matched, the adjustment data for keying into ACBS will be automatically generated when the 'Generate keying data' button is selected.`,
      );
    });

    it('should NOT display read-only text', () => {
      utilisationReportPage.tabs.premiumPaymentsContent.receivedPaymentsText().should('not.exist');
    });
  });

  describe(`when navigating to the page as ${USERS.PDC_READ}`, () => {
    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_READ);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    it('should display the page heading and date', () => {
      cy.assertText(utilisationReportPage.heading(), bankName);

      cy.assertText(utilisationReportPage.reportPeriodHeading(), reportPeriodString);
    });

    it('should display the correct tabs', () => {
      cy.assertText(utilisationReportPage.tabs.premiumPayments(), 'Premium payments');
      cy.assertText(utilisationReportPage.tabs.keyingSheet(), 'Keying sheet');
      cy.assertText(utilisationReportPage.tabs.paymentDetails(), 'Payment details');
      cy.assertText(utilisationReportPage.tabs.utilisation(), 'Utilisation');
    });

    it('should display the correct text', () => {
      cy.assertText(
        utilisationReportPage.tabs.premiumPaymentsContent.receivedPaymentsText(),
        `Received payments are entered against reported fees. When payments show as matched, the adjustment data for keying into ACBS will be automatically generated.`,
      );
    });

    it('should NOT display non-read-only text', () => {
      utilisationReportPage.tabs.premiumPaymentsContent.howToAddPaymentsText().should('not.exist');
      utilisationReportPage.tabs.premiumPaymentsContent.howToGenerateKeyingDataText().should('not.exist');
    });
  });
});

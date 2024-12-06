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
      bankName = reportBank.bankName;
    });

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([feeRecordAtToDoStatus]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
  });

  beforeEach(() => {
    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${reportId}`);
  });

  describe('when navigating to the page', () => {
    it('should display the page heading and date', () => {
      cy.assertText(utilisationReportPage.heading(), bankName);

      cy.assertText(utilisationReportPage.reportPeriodHeading(), reportPeriodString);
    });

    it('should display the correct tabs', () => {
      cy.assertText(utilisationReportPage.premiumPaymentsTabLink(), 'Premium payments');
      cy.assertText(utilisationReportPage.keyingSheetTabLink(), 'Keying sheet');
      cy.assertText(utilisationReportPage.paymentDetailsTabLink(), 'Payment details');
      cy.assertText(utilisationReportPage.utilisationTabLink(), 'Utilisation');
      cy.assertText(utilisationReportPage.recordCorrectionHistoryTabLink(), 'Record correction history');
    });
  });
});

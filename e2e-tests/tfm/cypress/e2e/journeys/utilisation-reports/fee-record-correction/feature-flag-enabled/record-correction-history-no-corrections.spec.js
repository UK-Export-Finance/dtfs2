import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder, FEE_RECORD_STATUS, PENDING_RECONCILIATION } from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

const { utilisationReportPage } = pages;
const { recordCorrectionHistoryTab } = utilisationReportPage;

context('Record correction history page - no corrections', () => {
  const bankId = '961';
  const reportId = 1;

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();
  const feeRecordAtToDoStatus = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build();

  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordAtToDoStatus]);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([feeRecordAtToDoStatus]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  beforeEach(() => {
    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${reportId}`);
    utilisationReportPage.recordCorrectionHistoryTabLink().click();
  });

  describe('when navigating to the page', () => {
    it('should display the tab heading and text', () => {
      cy.assertText(recordCorrectionHistoryTab.heading(), 'Record correction history');

      cy.assertText(utilisationReportPage.recordCorrectionHistoryTabLink(), 'Record correction history');

      cy.assertText(
        recordCorrectionHistoryTab.recordCorrectionAutomaticallyNotifiedText(),
        'You will be automatically notified via email when the record correction comes through from the bank.',
      );
    });

    describe('when no record corrections are present', () => {
      it('should display the "no record corrections" text', () => {
        recordCorrectionHistoryTab.viewHistoricRecordCorrectionText().should('not.to.exist');

        recordCorrectionHistoryTab.noRecordCorrectionsText().should('be.visible');

        cy.assertText(
          recordCorrectionHistoryTab.noRecordCorrectionsText(),
          'When a request for a record correction is made and submitted, it will appear here.',
        );
      });
    });
  });
});

import { FEE_RECORD_STATUS, FeeRecordEntityMockBuilder, PENDING_RECONCILIATION, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import { errorSummary } from '../../../../partials';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context('When fee record correction feature flag is enabled', () => {
  const bankId = '961';
  const reportId = 1;

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();
  const feeRecordAtToDoStatus = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build();

  const { premiumPaymentsTab } = pages.utilisationReportPage;

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

  context('PDC_READ users cannot create record correction requests', () => {
    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_READ);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    it('should not be able to initiate record correction request', () => {
      premiumPaymentsTab.createRecordCorrectionRequestButton().should('not.exist');
    });
  });

  context('PDC_RECONCILE users can create record correction requests', () => {
    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    it('should display error message if invalid selections for creating fee record correction request', () => {
      premiumPaymentsTab.createRecordCorrectionRequestButton().should('exist');
      premiumPaymentsTab.createRecordCorrectionRequestButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

      errorSummary().contains('Select a record to create a record correction request');
      premiumPaymentsTab.premiumPaymentsTable.error().should('exist');
      cy.assertText(premiumPaymentsTab.premiumPaymentsTable.error(), 'Error: Select a record to create a record correction request');
    });

    it('should be able to initiate record correction request', () => {
      premiumPaymentsTab.premiumPaymentsTable.checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status).click();

      premiumPaymentsTab.createRecordCorrectionRequestButton().should('exist');
      premiumPaymentsTab.createRecordCorrectionRequestButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));
    });
  });
});

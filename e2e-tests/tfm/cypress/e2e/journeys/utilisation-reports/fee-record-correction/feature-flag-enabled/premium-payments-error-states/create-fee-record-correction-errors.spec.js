import {
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../../../../pages';
import USERS from '../../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../../e2e-fixtures';
import relative from '../../../../../relativeURL';
import { errorSummary } from '../../../../../partials';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context('When fee record correction feature flag is enabled', () => {
  context('PDC_READ users cannot create record correction requests with invalid fee selections', () => {
    const bankId = '961';
    const reportId = 1;

    const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();
    const toDoFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build();
    const anotherToDoFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus(FEE_RECORD_STATUS.TO_DO).build();
    const doesNotMatchFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withId(3)
      .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
      .withPaymentCurrency(CURRENCY.GBP)
      .withPayments([PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()])
      .build();

    const { premiumPaymentsTab } = pages.utilisationReportPage;

    before(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
      const feeRecords = [toDoFeeRecord, anotherToDoFeeRecord, doesNotMatchFeeRecord];
      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
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
    });

    it('should not allow user to create fee record correction request with no fees selected', () => {
      premiumPaymentsTab.createRecordCorrectionRequestButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

      errorSummary().contains('Select a record to create a record correction request');
      premiumPaymentsTab.premiumPaymentsTable.error().should('exist');
      cy.assertText(premiumPaymentsTab.premiumPaymentsTable.error(), 'Error: Select a record to create a record correction request');
    });

    it('should not allow user to create fee record correction request with multiple fees selected', () => {
      premiumPaymentsTab.premiumPaymentsTable.checkbox([toDoFeeRecord.id], toDoFeeRecord.paymentCurrency, toDoFeeRecord.status).click();
      premiumPaymentsTab.premiumPaymentsTable.checkbox([anotherToDoFeeRecord.id], anotherToDoFeeRecord.paymentCurrency, anotherToDoFeeRecord.status).click();
      premiumPaymentsTab.createRecordCorrectionRequestButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

      errorSummary().contains('Select one fee for a fee record correction request');
      premiumPaymentsTab.premiumPaymentsTable.error().should('exist');
      cy.assertText(premiumPaymentsTab.premiumPaymentsTable.error(), 'Error: Select one fee for a fee record correction request');
    });

    it('should not allow user to create fee record correction request for fee not in TO_DO status', () => {
      premiumPaymentsTab.premiumPaymentsTable.checkbox([doesNotMatchFeeRecord.id], doesNotMatchFeeRecord.paymentCurrency, doesNotMatchFeeRecord.status).click();
      premiumPaymentsTab.createRecordCorrectionRequestButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

      errorSummary().contains("Select a fee in 'To do' status to create a record correction request");
      premiumPaymentsTab.premiumPaymentsTable.error().should('exist');
      cy.assertText(premiumPaymentsTab.premiumPaymentsTable.error(), "Error: Select a fee in 'To do' status to create a record correction request");
    });
  });
});

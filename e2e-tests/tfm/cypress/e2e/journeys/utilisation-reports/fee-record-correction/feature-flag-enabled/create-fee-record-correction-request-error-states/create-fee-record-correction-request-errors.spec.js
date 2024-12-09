import {
  FEE_RECORD_STATUS,
  RECORD_CORRECTION_REASON,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
  MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT,
} from '@ukef/dtfs2-common';
import pages from '../../../../../pages';
import USERS from '../../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../../e2e-fixtures';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context('When fee record correction feature flag is enabled', () => {
  const bankId = '961';
  const reportId = 1;

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();
  const feeRecordAtToDoStatus = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build();

  const { premiumPaymentsTab } = pages.utilisationReportPage;
  const { reasonCheckbox, reasonsInputError, additionalInfoInput, additionalInfoInputError, errorSummaryErrors } = pages.createFeeRecordCorrectionRequestPage;

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

  context('PDC_RECONCILE users cannot create record correction requests with invalid form values', () => {
    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${reportId}`);

      premiumPaymentsTab.premiumPaymentsTable.checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status).click();

      premiumPaymentsTab.createRecordCorrectionRequestButton().should('exist');
      premiumPaymentsTab.createRecordCorrectionRequestButton().click();
    });

    it('should not allow user to create fee record correction request with an empty form', () => {
      cy.clickContinueButton();

      const expectedReasonsErrorMessage = 'You must select a reason for the record correction request';
      const expectedAdditionalInfoErrorMessage = 'You must provide more information for the record correction request';

      errorSummaryErrors().should('have.length', 2);
      cy.assertText(errorSummaryErrors().eq(0), expectedReasonsErrorMessage);
      cy.assertText(errorSummaryErrors().eq(1), expectedAdditionalInfoErrorMessage);

      cy.assertText(reasonsInputError(), `Error: ${expectedReasonsErrorMessage}`);
      cy.assertText(additionalInfoInputError(), `Error: ${expectedAdditionalInfoErrorMessage}`);
    });

    it(`should not allow user to create fee record correction request with more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the provide more information box`, () => {
      reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).check();

      const additionalInfo = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT + 1);
      cy.keyboardInput(additionalInfoInput(), additionalInfo);

      cy.clickContinueButton();

      const errorMessage = `You cannot enter more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters in the provide more information box`;

      errorSummaryErrors().should('have.length', 1);
      cy.assertText(errorSummaryErrors().eq(0), errorMessage);

      cy.assertText(additionalInfoInputError(), `Error: ${errorMessage}`);

      additionalInfoInput().should('have.value', additionalInfo);
    });
  });
});

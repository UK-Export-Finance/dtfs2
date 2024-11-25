import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
  RECORD_CORRECTION_REQUEST_REASON,
} from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import partials, { errorSummary } from '../../../../partials';
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

      cy.visit(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`);

      cy.url().should('eq', relative('/utilisation-reports'));
    });
  });

  context('PDC_RECONCILE users can create record correction requests', () => {
    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    it('should display error message if invalid selections for initiating a "create record correction" request', () => {
      premiumPaymentsTab.createRecordCorrectionRequestButton().should('exist');
      premiumPaymentsTab.createRecordCorrectionRequestButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

      errorSummary().contains('Select a record to create a record correction request');
      premiumPaymentsTab.premiumPaymentsTable.error().should('exist');
      cy.assertText(premiumPaymentsTab.premiumPaymentsTable.error(), 'Error: Select a record to create a record correction request');
    });

    it('should be able to initiate a record correction request', () => {
      premiumPaymentsTab.premiumPaymentsTable.checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status).click();

      premiumPaymentsTab.createRecordCorrectionRequestButton().should('exist');
      premiumPaymentsTab.createRecordCorrectionRequestButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));
    });

    context('when the user navigates to the "create record correction request" page', () => {
      const { mainHeading } = pages.createFeeRecordCorrectionRequestPage;
      const { feeRecordSummary } = partials;

      beforeEach(() => {
        premiumPaymentsTab.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .click();

        premiumPaymentsTab.createRecordCorrectionRequestButton().should('exist');
        premiumPaymentsTab.createRecordCorrectionRequestButton().click();
      });

      it('should render the create record correction request page with selected fee record details', () => {
        cy.assertText(mainHeading(), 'Record correction request');

        feeRecordSummary.container().should('exist');
        cy.assertText(feeRecordSummary.facilityId(), feeRecordAtToDoStatus.facilityId);
        cy.assertText(feeRecordSummary.exporter(), feeRecordAtToDoStatus.exporter);
        cy.assertText(feeRecordSummary.requestedBy(), `${USERS.PDC_RECONCILE.firstName} ${USERS.PDC_RECONCILE.lastName}`);
      });
    });

    context('when the user submits the "create record correction request" form with invalid values', () => {
      const { reasonsInputError, additionalInfoInput, additionalInfoInputError, errorSummaryErrors } = pages.createFeeRecordCorrectionRequestPage;

      beforeEach(() => {
        premiumPaymentsTab.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .click();

        premiumPaymentsTab.createRecordCorrectionRequestButton().should('exist');
        premiumPaymentsTab.createRecordCorrectionRequestButton().click();
      });

      it('should display validation errors', () => {
        const additionalInfo = 'a'.repeat(501);
        cy.keyboardInput(additionalInfoInput(), additionalInfo);

        cy.clickContinueButton();

        const expectedReasonsErrorMessage = 'You must select a reason for the record correction request';
        const expectedAdditionalInfoErrorMessage = 'You cannot enter more than 500 characters in the provide more information box';

        errorSummaryErrors().should('have.length', 2);
        cy.assertText(errorSummaryErrors().eq(0), expectedReasonsErrorMessage);
        cy.assertText(errorSummaryErrors().eq(1), expectedAdditionalInfoErrorMessage);

        cy.assertText(reasonsInputError(), `Error: ${expectedReasonsErrorMessage}`);
        cy.assertText(additionalInfoInputError(), `Error: ${expectedAdditionalInfoErrorMessage}`);

        additionalInfoInput().should('have.value', additionalInfo);
      });
    });

    context('when the user submits the "create record correction request" form with valid values', () => {
      const { reasonCheckbox, additionalInfoInput } = pages.createFeeRecordCorrectionRequestPage;

      beforeEach(() => {
        premiumPaymentsTab.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .click();

        premiumPaymentsTab.createRecordCorrectionRequestButton().should('exist');
        premiumPaymentsTab.createRecordCorrectionRequestButton().click();
      });

      it('should redirect the user to the "check the information" page', () => {
        reasonCheckbox(RECORD_CORRECTION_REQUEST_REASON.FACILITY_ID_INCORRECT).check();
        reasonCheckbox(RECORD_CORRECTION_REQUEST_REASON.OTHER).check();
        cy.keyboardInput(additionalInfoInput(), 'Some additional info.');

        cy.clickContinueButton();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}/check-the-information`));
      });
    });
  });
});

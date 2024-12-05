import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
  RECORD_CORRECTION_REASON,
} from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import { feeRecordSummary, mainHeading } from '../../../../partials';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context('When fee record correction feature flag is enabled', () => {
  const bankId = '961';
  const reportId = 1;

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();
  const feeRecordAtToDoStatus = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build();

  const { premiumPaymentsTab } = pages.utilisationReportPage;

  beforeEach(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordAtToDoStatus]);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([feeRecordAtToDoStatus]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
  });

  afterEach(() => {
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
    const { createFeeRecordCorrectionRequestPage, checkFeeRecordCorrectionRequestPage } = pages;

    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    it('should be able to create a record correction request', () => {
      premiumPaymentsTab.premiumPaymentsTable.checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status).click();

      premiumPaymentsTab.createRecordCorrectionRequestButton().should('exist');
      premiumPaymentsTab.createRecordCorrectionRequestButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

      //---------------------------------------------------------------
      // Check the "Create record correction request" page
      //---------------------------------------------------------------
      cy.assertText(mainHeading(), 'Record correction request');

      feeRecordSummary.container().should('exist');
      cy.assertText(feeRecordSummary.facilityId(), feeRecordAtToDoStatus.facilityId);
      cy.assertText(feeRecordSummary.exporter(), feeRecordAtToDoStatus.exporter);
      cy.assertText(feeRecordSummary.requestedBy(), `${USERS.PDC_RECONCILE.firstName} ${USERS.PDC_RECONCILE.lastName}`);

      createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).check();
      createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).check();
      cy.keyboardInput(createFeeRecordCorrectionRequestPage.additionalInfoInput(), 'Some additional info.');

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}/check-the-information`));
    });

    context('when user clicks back on the create record correction request screen', () => {
      it('should return to premium payments tab with the checkbox selected', () => {
        premiumPaymentsTab.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .click();

        premiumPaymentsTab.createRecordCorrectionRequestButton().click();

        cy.clickBackLink();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}?selectedFeeRecordIds=${feeRecordAtToDoStatus.id}`));

        premiumPaymentsTab.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .should('be.checked');
      });
    });

    context('when user abandons their journey on the "check the information" screen and then starts again', () => {
      beforeEach(() => {
        premiumPaymentsTab.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .click();

        premiumPaymentsTab.createRecordCorrectionRequestButton().click();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).check();
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).check();
        cy.keyboardInput(createFeeRecordCorrectionRequestPage.additionalInfoInput(), 'Some additional info.');

        cy.clickContinueButton();

        // Verify that the submission was successful.
        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}/check-the-information`));

        // Abandon the journey by navigating to the report page.
        cy.visit(`utilisation-reports/${reportId}`);

        // Restart the journey using the same fee record.
        premiumPaymentsTab.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .click();

        premiumPaymentsTab.createRecordCorrectionRequestButton().click();
      });

      it('should populate the "create record correction request" form with the prior form data', () => {
        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).should('be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).should('be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT).should('not.be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT).should('not.be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.UTILISATION_INCORRECT).should('not.be.checked');

        cy.assertText(createFeeRecordCorrectionRequestPage.additionalInfoInput(), 'Some additional info.');
      });
    });

    context('when user clicks back on the "check the information" screen', () => {
      beforeEach(() => {
        premiumPaymentsTab.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .click();

        premiumPaymentsTab.createRecordCorrectionRequestButton().click();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).check();
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).check();
        cy.keyboardInput(createFeeRecordCorrectionRequestPage.additionalInfoInput(), 'Some additional info.');

        cy.clickContinueButton();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}/check-the-information`));

        cy.clickBackLink();
      });

      it('should return to the "create record correction request" screen with the form populated with the prior form data', () => {
        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).should('be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).should('be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT).should('not.be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT).should('not.be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.UTILISATION_INCORRECT).should('not.be.checked');

        cy.assertText(createFeeRecordCorrectionRequestPage.additionalInfoInput(), 'Some additional info.');
      });
    });

    context('when user clicks change on the "check the information" screen', () => {
      beforeEach(() => {
        premiumPaymentsTab.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .click();

        premiumPaymentsTab.createRecordCorrectionRequestButton().click();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).check();
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).check();
        cy.keyboardInput(createFeeRecordCorrectionRequestPage.additionalInfoInput(), 'Some additional info.');

        cy.clickContinueButton();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}/check-the-information`));

        checkFeeRecordCorrectionRequestPage.clickReasonsChangeLink();
      });

      it('should return to the "create record correction request" screen with the form populated with the prior form data', () => {
        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).should('be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).should('be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT).should('not.be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT).should('not.be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.UTILISATION_INCORRECT).should('not.be.checked');

        cy.assertText(createFeeRecordCorrectionRequestPage.additionalInfoInput(), 'Some additional info.');
      });
    });
  });
});

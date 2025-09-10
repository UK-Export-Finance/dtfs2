import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from "@ukef/dtfs2-common/test-helpers";
import {
  FEE_RECORD_STATUS,
  PENDING_RECONCILIATION,
  RECORD_CORRECTION_REASON,
  MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT,
} from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import { feeRecordSummary, mainHeading, cancelLink } from '../../../../partials';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context('When fee record correction feature flag is enabled', () => {
  const bankId = '961';
  const reportId = 1;

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();
  const feeRecordAtToDoStatus = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build();

  const { premiumPaymentsContent } = pages.utilisationReportPage.tabs;

  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([feeRecordAtToDoStatus]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
  });

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORD_CORRECTION_REQUEST_TRANSIENT_FORM_DATA_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordAtToDoStatus]);
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
      premiumPaymentsContent.createRecordCorrectionRequestButton().should('not.exist');

      cy.visit(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`);

      cy.url().should('eq', relative('/utilisation-reports'));
    });
  });

  context('PDC_RECONCILE users can create record correction requests', () => {
    const { createFeeRecordCorrectionRequestPage } = pages;
    const additionalInfoUserInput = 'Some additional info.';

    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${reportId}`);

      premiumPaymentsContent.premiumPaymentsTable
        .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
        .click();
      premiumPaymentsContent.createRecordCorrectionRequestButton().click();
    });

    it('should be able to initiate a record correction request', () => {
      cy.assertText(mainHeading(), 'Record correction request');
    });

    it('should have a cancel link', () => {
      cy.assertText(cancelLink(), 'Cancel record correction request');

      cancelLink().should('have.attr', 'href', `/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}/cancel`);
    });

    context('when a user has initiated the correction request journey', () => {
      beforeEach(() => {
        cy.visit(`utilisation-reports/${reportId}`);

        premiumPaymentsContent.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .click();
        premiumPaymentsContent.createRecordCorrectionRequestButton().click();
      });

      it('should be able to view the fee record summary on the create record correction request screen', () => {
        cy.assertText(mainHeading(), 'Record correction request');

        feeRecordSummary.container().should('exist');
        cy.assertText(feeRecordSummary.facilityId(), feeRecordAtToDoStatus.facilityId);
        cy.assertText(feeRecordSummary.exporter(), feeRecordAtToDoStatus.exporter);
        cy.assertText(feeRecordSummary.requestedBy(), `${USERS.PDC_RECONCILE.firstName} ${USERS.PDC_RECONCILE.lastName}`);
      });

      it('should be able to fill in the form and get redirected to the check the info page', () => {
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).check();
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).check();
        cy.keyboardInput(createFeeRecordCorrectionRequestPage.additionalInfoInput(), additionalInfoUserInput);

        cy.clickContinueButton();

        cy.assertText(mainHeading(), 'Check the information before submitting the record correction request');
      });
    });

    context('when user clicks back on the create record correction request screen', () => {
      it('should return to premium payments tab with the checkbox selected', () => {
        cy.clickBackLink();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}?selectedFeeRecordIds=${feeRecordAtToDoStatus.id}`));

        premiumPaymentsContent.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .should('be.checked');
      });
    });

    context('when user clicks cancel', () => {
      beforeEach(() => {
        cy.visit(`utilisation-reports/${reportId}`);

        premiumPaymentsContent.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .click();

        premiumPaymentsContent.createRecordCorrectionRequestButton().click();

        cy.clickCancelLink();
      });

      it('should redirect to the utilisation report page with the fee record still checked', () => {
        cy.url().should('eq', relative(`/utilisation-reports/${reportId}?selectedFeeRecordIds=${feeRecordAtToDoStatus.id}`));

        premiumPaymentsContent.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .should('be.checked');
      });
    });

    it('should let the user enter additional info equal to the character limit containing special characters', () => {
      createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).check();

      const specialCharactersToTest = '&!?$£¥€¢^*()_+=-%:;@~/><,.';
      const paddingToReachMaxLength = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT - specialCharactersToTest.length);
      const additionalInfo = `${specialCharactersToTest}${paddingToReachMaxLength}`;
      cy.keyboardInput(createFeeRecordCorrectionRequestPage.additionalInfoInput(), additionalInfo);

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}/check-the-information`));
    });
  });
});

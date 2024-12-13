import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
  RECORD_CORRECTION_REASON,
} from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import BANKS from '../../../../../fixtures/banks';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import { summaryList, mainHeading } from '../../../../partials';
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

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([feeRecordAtToDoStatus]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
  });

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORD_CORRECTION_TRANSIENT_FORM_DATA_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordAtToDoStatus]);
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  context('PDC_READ users cannot send record correction requests', () => {
    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_READ);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    it('should not be able to access record correction request check the information page', () => {
      cy.visit(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}/check-the-information`);

      cy.url().should('eq', relative('/utilisation-reports'));
    });
  });

  context('PDC_RECONCILE users can send record correction requests', () => {
    const { createFeeRecordCorrectionRequestPage, checkFeeRecordCorrectionRequestPage, feeRecordCorrectionRequestSentPage } = pages;
    const additionalInfoUserInput = 'Some additional info.\nSome special characters &$%!<>?@*()_+={}[];:~`\'"';
    const expectedBankEmails = BANKS.find((bank) => bank.id === bankId).paymentOfficerTeam.emails;

    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${reportId}`);

      premiumPaymentsTab.premiumPaymentsTable.checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status).click();

      premiumPaymentsTab.createRecordCorrectionRequestButton().click();

      createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).check();
      createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).check();
      cy.keyboardInput(createFeeRecordCorrectionRequestPage.additionalInfoInput(), additionalInfoUserInput);

      cy.clickContinueButton();
    });

    it('should be able to view the form values and other details of correction request', () => {
      summaryList().should('exist');
      summaryList().should('contain', feeRecordAtToDoStatus.facilityId);
      summaryList().should('contain', feeRecordAtToDoStatus.exporter);
      summaryList().should('contain', `${USERS.PDC_RECONCILE.firstName} ${USERS.PDC_RECONCILE.lastName}`);
      // These values are the display values corresponding to the reasons selected in the beforeEach
      summaryList().should('contain', 'Facility ID is incorrect, Other');
      summaryList().should('contain', additionalInfoUserInput);

      // The contact email addresses are taken from the bank payment officer team
      summaryList().should('contain', expectedBankEmails.join(', '));
    });

    context('when the user clicks the "continue" button', () => {
      beforeEach(() => {
        cy.clickContinueButton();
      });

      it('should be able to send the record correction request', () => {
        cy.assertText(mainHeading(), 'Record correction request');
        feeRecordCorrectionRequestSentPage.requestSentPanel().should('exist');
        feeRecordCorrectionRequestSentPage.requestSentPanel().should('contain', 'Request sent');
        feeRecordCorrectionRequestSentPage.requestSentPanel().should('contain', 'Your record correction request has been sent');
        cy.assertText(feeRecordCorrectionRequestSentPage.otherEmailAddress(1), expectedBankEmails[0]);
        cy.assertText(feeRecordCorrectionRequestSentPage.otherEmailAddress(2), expectedBankEmails[1]);
        cy.assertText(feeRecordCorrectionRequestSentPage.userEmailAddressCopy(), `A copy of the email has also been sent to ${USERS.PDC_RECONCILE.email}.`);

        cy.visit(`utilisation-reports/${reportId}`);
        cy.assertText(premiumPaymentsTab.premiumPaymentsTable.status(feeRecordAtToDoStatus.id), 'Record correction sent');
      });

      context('and then user clicks the "back to premium payments" button', () => {
        beforeEach(() => {
          feeRecordCorrectionRequestSentPage.backToPremiumPaymentsButton().click();
        });

        it('should return to the premium payments tab', () => {
          cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));
        });
      });
    });

    context('when user abandons their journey, without cancelling', () => {
      beforeEach(() => {
        // Abandon the journey by navigating to the report page.
        cy.visit(`utilisation-reports/${reportId}`);
      });

      context('and clicks the "create record correction request" button again', () => {
        beforeEach(() => {
          // Restart the journey using the same fee record.
          premiumPaymentsTab.premiumPaymentsTable
            .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
            .click();

          premiumPaymentsTab.createRecordCorrectionRequestButton().click();
        });

        it('should not populate the "create record correction request" form with any form data', () => {
          cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

          Object.values(RECORD_CORRECTION_REASON).forEach((reason) => {
            createFeeRecordCorrectionRequestPage.reasonCheckbox(reason).should('not.be.checked');
          });

          cy.assertText(createFeeRecordCorrectionRequestPage.additionalInfoInput(), '');
        });
      });

      context('and navigates directly to the "create record correction request" page', () => {
        beforeEach(() => {
          cy.visit(`utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`);
        });

        it('should populate the "create record correction request" form with the prior form data', () => {
          cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

          createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).should('be.checked');
          createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).should('be.checked');

          createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT).should('not.be.checked');
          createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT).should('not.be.checked');
          createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.UTILISATION_INCORRECT).should('not.be.checked');

          cy.assertText(createFeeRecordCorrectionRequestPage.additionalInfoInput(), additionalInfoUserInput);
        });
      });
    });

    context('when user abandons their journey by clicking the cancel button', () => {
      beforeEach(() => {
        cy.clickCancelButton();
      });

      it('should redirect to the utilisation report page with the fee record still checked', () => {
        cy.url().should('eq', relative(`/utilisation-reports/${reportId}?selectedFeeRecordIds=${feeRecordAtToDoStatus.id}`));

        premiumPaymentsTab.premiumPaymentsTable
          .checkbox([feeRecordAtToDoStatus.id], feeRecordAtToDoStatus.paymentCurrency, feeRecordAtToDoStatus.status)
          .should('be.checked');
      });

      context('and clicks the "create record correction request" button again', () => {
        beforeEach(() => {
          // Note that the same fee record is already checked due to the 'selectedFeeRecordIds' query parameter.
          premiumPaymentsTab.createRecordCorrectionRequestButton().click();
        });

        it('should not populate the "create record correction request" form with any form data', () => {
          cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

          Object.values(RECORD_CORRECTION_REASON).forEach((reason) => {
            createFeeRecordCorrectionRequestPage.reasonCheckbox(reason).should('not.be.checked');
          });

          cy.assertText(createFeeRecordCorrectionRequestPage.additionalInfoInput(), '');
        });
      });

      context('and navigates directly to the "create record correction request" page', () => {
        beforeEach(() => {
          cy.visit(`utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`);
        });

        it('should not populate the "create record correction request" form with any form data', () => {
          cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

          Object.values(RECORD_CORRECTION_REASON).forEach((reason) => {
            createFeeRecordCorrectionRequestPage.reasonCheckbox(reason).should('not.be.checked');
          });

          cy.assertText(createFeeRecordCorrectionRequestPage.additionalInfoInput(), '');
        });
      });
    });

    context('when user clicks back', () => {
      beforeEach(() => {
        cy.clickBackLink();
      });

      it('should return to the "create record correction request" screen with the form populated with the prior form data', () => {
        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).should('be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).should('be.checked');

        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT).should('not.be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT).should('not.be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.UTILISATION_INCORRECT).should('not.be.checked');

        cy.assertText(createFeeRecordCorrectionRequestPage.additionalInfoInput(), additionalInfoUserInput);
      });
    });

    context('when user clicks change', () => {
      beforeEach(() => {
        checkFeeRecordCorrectionRequestPage.reasonsChangeLink().click();
      });

      it('should return to the "create record correction request" screen with the form populated with the prior form data', () => {
        cy.url().should('eq', relative(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordAtToDoStatus.id}`));

        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT).should('be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.OTHER).should('be.checked');

        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT).should('not.be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT).should('not.be.checked');
        createFeeRecordCorrectionRequestPage.reasonCheckbox(RECORD_CORRECTION_REASON.UTILISATION_INCORRECT).should('not.be.checked');

        cy.assertText(createFeeRecordCorrectionRequestPage.additionalInfoInput(), additionalInfoUserInput);
      });
    });
  });
});

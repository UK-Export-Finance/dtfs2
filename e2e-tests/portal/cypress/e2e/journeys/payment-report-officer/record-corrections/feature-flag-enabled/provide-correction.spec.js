import {
  UtilisationReportEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  PENDING_RECONCILIATION,
  FeeRecordEntityMockBuilder,
  FEE_RECORD_STATUS,
  RECORD_CORRECTION_REASON,
  CURRENCY,
  mapReasonsToDisplayValues,
  getFormattedCurrencyAndAmount,
  getFormattedMonetaryValue,
} from '@ukef/dtfs2-common';
import { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import { provideCorrection, pendingCorrections, reviewCorrection } from '../../../../pages';
import { correctionRequestDetails } from '../../../../partials';
import { tfmFacilityForReport } from '../../../../../fixtures/mockUtilisationReportDetails';

context('Provide correction - Fee record correction feature flag enabled', () => {
  context('Report GEF utilisation and fees page', () => {
    beforeEach(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
    });

    after(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
    });

    context('When there is a pending correction', () => {
      const pendingCorrectionDetails = {
        id: 2,
        facilityId: '1234',
        exporter: 'test exporter',
        reportedFee: {
          amount: 77,
          currency: CURRENCY.GBP,
        },
        reasons: [
          RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
          RECORD_CORRECTION_REASON.OTHER,
        ],
        additionalInfo: 'Lots of additional info %$£%&^@&^',
      };

      const pendingCorrectionReportPeriod = { start: { month: 1, year: 2021 }, end: { month: 1, year: 2021 } };

      beforeEach(() => {
        cy.task('getUserFromDbByEmail', BANK1_PAYMENT_REPORT_OFFICER1.email).then((user) => {
          const { _id, bank } = user;
          const bankId = bank.id;

          const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
            .withId(1)
            .withUploadedByUserId(_id.toString())
            .withBankId(bankId)
            .withReportPeriod(pendingCorrectionReportPeriod)
            .build();
          const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
            .withId(1)
            .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
            .withFacilityId(pendingCorrectionDetails.facilityId)
            .withExporter(pendingCorrectionDetails.exporter)
            .withFeesPaidToUkefForThePeriodCurrency(pendingCorrectionDetails.reportedFee.currency)
            .withFeesPaidToUkefForThePeriod(pendingCorrectionDetails.reportedFee.amount)
            .build();
          const pendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
            .withId(pendingCorrectionDetails.id)
            .withIsCompleted(false)
            .withReasons(pendingCorrectionDetails.reasons)
            .withAdditionalInfo(pendingCorrectionDetails.additionalInfo)
            .build();

          cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
          cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
          cy.task(NODE_TASKS.INSERT_FEE_RECORD_CORRECTIONS_INTO_DB, [pendingCorrection]);
        });
      });

      context('and when a user has initiated the "provide correction" journey', () => {
        beforeEach(() => {
          cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
          cy.visit(relative(`/utilisation-report-upload`));

          pendingCorrections.row(1).correctionLink().click();
        });

        it('should be able to view the record correction request summary on the "provide correction" screen', () => {
          correctionRequestDetails.container().should('exist');

          cy.assertText(correctionRequestDetails.row.facilityId(), pendingCorrectionDetails.facilityId);
          cy.assertText(correctionRequestDetails.row.exporter(), pendingCorrectionDetails.exporter);
          cy.assertText(correctionRequestDetails.row.reportedFees(), getFormattedCurrencyAndAmount(pendingCorrectionDetails.reportedFee));
          cy.assertText(correctionRequestDetails.row.formattedReasons(), mapReasonsToDisplayValues(pendingCorrectionDetails.reasons).join(', '));
          cy.assertText(correctionRequestDetails.row.additionalInfo(), pendingCorrectionDetails.additionalInfo);
        });

        it('should be able to see only the form fields relevant to the correction request reasons', () => {
          provideCorrection.facilityIdInput.container().should('exist');
          provideCorrection.reportedFeeInput.container().should('exist');
          provideCorrection.reportedCurrency.container().should('exist');
          provideCorrection.utilisationInput.container().should('not.exist');
          provideCorrection.additionalComments.input().should('exist');
        });

        context('and when the user clicks cancel', () => {
          beforeEach(() => {
            cy.clickCancelButton();
          });

          it('should redirect to the "Report GEF utilisation and fees paid" page', () => {
            cy.url().should('eq', relative(`/utilisation-reports/provide-correction/${pendingCorrectionDetails.id}/check-the-information`));
          });
        });

        context('and when the user has entered invalid values and clicked "save and review changes"', () => {
          const newFacilityId = 'abc';
          const newReportedFee = 'INVALID';
          const additionalComments = ' ';

          beforeEach(() => {
            cy.keyboardInput(provideCorrection.facilityIdInput.container(), newFacilityId);
            cy.keyboardInput(provideCorrection.reportedFeeInput.container(), newReportedFee);
            cy.keyboardInput(provideCorrection.additionalComments.input(), additionalComments);

            cy.clickContinueButton();
          });

          it('should display the validation errors', () => {
            const expectedFacilityIdInputError = 'Error: You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only';
            const expectedReportedCurrencyError = 'Error: You must select a currency';
            const expectedReportedFeeInputError = 'Error: You must enter the reported fee in a valid format';
            const expectedAdditionalCommentsError = 'Error: You must enter a comment';

            provideCorrection.errorSummary.items().should('have.length', 4);

            provideCorrection.facilityIdInput.error().should('exist');
            cy.assertText(provideCorrection.facilityIdInput.error(), expectedFacilityIdInputError);

            provideCorrection.reportedCurrency.error().should('exist');
            cy.assertText(provideCorrection.reportedCurrency.error(), expectedReportedCurrencyError);

            provideCorrection.reportedFeeInput.error().should('exist');
            cy.assertText(provideCorrection.reportedFeeInput.error(), expectedReportedFeeInputError);

            provideCorrection.utilisationInput.error().should('not.exist');

            provideCorrection.additionalComments.error().should('exist');
            cy.assertText(provideCorrection.additionalComments.error(), expectedAdditionalCommentsError);
          });

          it('should retain the values entered by the user', () => {
            provideCorrection.facilityIdInput.container().should('have.value', newFacilityId);
            provideCorrection.reportedFeeInput.container().should('have.value', newReportedFee);
            provideCorrection.additionalComments.input().should('have.value', additionalComments);

            Object.values(CURRENCY).forEach((currency) => {
              provideCorrection.reportedCurrency.radioInput(currency).should('not.be.checked');
            });
          });
        });

        context('and when the user has entered valid values and clicked "save and review changes"', () => {
          const newFacilityId = '77777777';
          const newReportedFee = '12345.67';
          const newReportedCurrency = CURRENCY.JPY;
          const additionalComments = 'Some additional comments & Some more additional comments';

          beforeEach(() => {
            const matchingTfmFacility = {
              ...tfmFacilityForReport,
              facilitySnapshot: {
                ...tfmFacilityForReport.facilitySnapshot,
                ukefFacilityId: newFacilityId,
              },
            };

            cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [matchingTfmFacility]);

            cy.keyboardInput(provideCorrection.facilityIdInput.container(), newFacilityId);
            cy.keyboardInput(provideCorrection.reportedFeeInput.container(), newReportedFee);
            provideCorrection.reportedCurrency.radioInput(newReportedCurrency).click();
            cy.keyboardInput(provideCorrection.additionalComments.input(), additionalComments);

            cy.clickContinueButton();
          });

          it('should redirect to the review page', () => {
            cy.url().should('eq', relative(`/utilisation-reports/provide-correction/${pendingCorrectionDetails.id}/check-the-information`));
          });

          it('should retain the values entered by the user when they return to the page via the review page change link', () => {
            reviewCorrection.changeNewValuesLink().click();

            provideCorrection.facilityIdInput.container().should('have.value', newFacilityId);
            provideCorrection.reportedFeeInput.container().should('have.value', getFormattedMonetaryValue(newReportedFee));
            provideCorrection.reportedCurrency.radioInput(newReportedCurrency).should('be.checked');
            provideCorrection.additionalComments.input().should('have.value', additionalComments);
          });

          it('should NOT retain the values entered by the user when they navigate away and restart the journey', () => {
            cy.visit(relative(`/utilisation-report-upload`));

            pendingCorrections.row(1).correctionLink().click();

            provideCorrection.facilityIdInput.container().should('have.value', '');
            provideCorrection.reportedFeeInput.container().should('have.value', '');
            provideCorrection.reportedCurrency.radioInput(newReportedCurrency).should('not.be.checked');
            provideCorrection.additionalComments.input().should('have.value', '');
          });

          it('should NOT retain the values entered by the user when they cancel on the review page then navigate back directly via url', () => {
            cy.clickCancelButton();

            cy.visit(relative(`/utilisation-reports/provide-correction/${pendingCorrectionDetails.id}`));

            provideCorrection.facilityIdInput.container().should('have.value', '');
            provideCorrection.reportedFeeInput.container().should('have.value', '');
            provideCorrection.reportedCurrency.radioInput(newReportedCurrency).should('not.be.checked');
            provideCorrection.additionalComments.input().should('have.value', '');
          });
        });
      });
    });
  });
});

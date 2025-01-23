import {
  UtilisationReportEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  PENDING_RECONCILIATION,
  FeeRecordEntityMockBuilder,
  FEE_RECORD_STATUS,
  RECORD_CORRECTION_REASON,
  CURRENCY,
  mapReasonsToDisplayValues,
} from '@ukef/dtfs2-common';
import { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import { provideCorrection, pendingCorrections, reviewCorrection } from '../../../../pages';

context('Check the information page - Fee record correction feature flag enabled', () => {
  context('When a correction has been provided', () => {
    const reportPeriod = { start: { month: 1, year: 2021 }, end: { month: 1, year: 2021 } };

    const reasons = [
      RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
      RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
      RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
    ];
    const pdcErrorSummary = 'Some PDC error summary';

    const exporter = 'An exporter';
    const oldUtilisation = 987.65;
    const oldReportedFees = {
      currency: CURRENCY.GBP,
      amount: 123.45,
    };

    const newUtilisation = 100.23;
    const newReportedFees = {
      currency: CURRENCY.USD,
      amount: 543.21,
    };
    const bankAdditionalComments = 'Some additional bank comments';

    beforeEach(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

      cy.task('getUserFromDbByEmail', BANK1_PAYMENT_REPORT_OFFICER1.email).then((user) => {
        const { _id, bank } = user;
        const bankId = bank.id;

        const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
          .withUploadedByUserId(_id.toString())
          .withBankId(bankId)
          .withReportPeriod(reportPeriod)
          .build();

        const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withExporter(exporter)
          .withFacilityUtilisation(oldUtilisation)
          .withFeesPaidToUkefForThePeriod(oldReportedFees.amount)
          .withFeesPaidToUkefForThePeriodCurrency(oldReportedFees.currency)
          .build();

        const pendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
          .withId(3)
          .withIsCompleted(false)
          .withReasons(reasons)
          .withAdditionalInfo(pdcErrorSummary)
          .build();

        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
        cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
        cy.task(NODE_TASKS.INSERT_FEE_RECORD_CORRECTIONS_INTO_DB, [pendingCorrection]);
      });

      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relative(`/utilisation-report-upload`));

      pendingCorrections.row(1).correctionLink().click();

      provideCorrection.reportedCurrency.radioInput(newReportedFees.currency).click();
      cy.keyboardInput(provideCorrection.reportedFeeInput(), newReportedFees.amount);
      cy.keyboardInput(provideCorrection.utilisationInput(), newUtilisation);
      cy.keyboardInput(provideCorrection.additionalComments.input(), bankAdditionalComments);

      cy.clickContinueButton();
    });

    after(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    });

    it('should be able to view the form values and other details of correction request', () => {
      reviewCorrection.originalValuesSummaryList().should('exist');
      reviewCorrection.originalValuesSummaryList().should('contain', exporter);
      reviewCorrection.originalValuesSummaryList().should('contain', oldReportedFees.currency);
      reviewCorrection.originalValuesSummaryList().should('contain', oldReportedFees.amount);

      const expectedCorrectionReasons = mapReasonsToDisplayValues(reasons).join(', ');
      const expectedOldValues = `${oldUtilisation}, ${oldReportedFees.currency}, ${oldReportedFees.amount}`;
      const expectedNewValues = `${newUtilisation}, ${newReportedFees.currency}, ${newReportedFees.amount}`;

      reviewCorrection.recordCorrectionDetailsSummaryList().should('exist');
      reviewCorrection.recordCorrectionDetailsSummaryList().should('contain', expectedCorrectionReasons);
      reviewCorrection.recordCorrectionDetailsSummaryList().should('contain', pdcErrorSummary);
      reviewCorrection.recordCorrectionDetailsSummaryList().should('contain', expectedOldValues);
      reviewCorrection.recordCorrectionDetailsSummaryList().should('contain', expectedNewValues);
      reviewCorrection.recordCorrectionDetailsSummaryList().should('contain', bankAdditionalComments);
    });

    context('and when the user clicks cancel', () => {
      beforeEach(() => {
        cy.clickCancelButton();
      });

      it('should redirect to the "Report GEF utilisation and fees paid" page', () => {
        cy.url().should('eq', relative('/utilisation-report-upload'));
      });
    });
  });
});

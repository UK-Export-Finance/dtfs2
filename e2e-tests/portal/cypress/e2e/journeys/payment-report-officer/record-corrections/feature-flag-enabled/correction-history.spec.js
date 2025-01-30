const {
  UtilisationReportEntityMockBuilder,
  PENDING_RECONCILIATION,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  FEE_RECORD_STATUS,
  RECORD_CORRECTION_REASON,
} = require('@ukef/dtfs2-common');
const { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } = require('../../../../../../../e2e-fixtures');
const relativeURL = require('../../../../relativeURL');
const { correctionHistory } = require('../../../../pages');
const { mainHeading } = require('../../../../partials');

context('Correction history - Fee record correction feature flag enabled', () => {
  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
  });

  context('When there are no completed corrections', () => {
    beforeEach(() => {
      cy.task('getUserFromDbByEmail', BANK1_PAYMENT_REPORT_OFFICER1.email).then((user) => {
        const { _id, bank } = user;
        const bankId = bank.id;

        const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
          .withId(1)
          .withUploadedByUserId(_id.toString())
          .withBankId(bankId)
          .build();

        const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();

        const pendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false).build();

        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
        cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
        cy.task(NODE_TASKS.INSERT_FEE_RECORD_CORRECTIONS_INTO_DB, [pendingCorrection]);
      });

      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL(`/utilisation-reports/correction-history`));
    });

    afterEach(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    });

    it('should display page heading', () => {
      mainHeading().should('exist');
      cy.assertText(mainHeading(), 'Record correction history');
    });

    it('should not display correction history table', () => {
      correctionHistory.table().should('not.exist');
    });

    it('should display an info message explaining there are no completed record correction requests to the user', () => {
      correctionHistory.noCorrectionsTextLine1().should('exist');
      cy.assertText(correctionHistory.noCorrectionsTextLine1(), 'There are no previous record correction requests.');

      correctionHistory.noCorrectionsTextLine2().should('exist');
      cy.assertText(correctionHistory.noCorrectionsTextLine2(), 'Records will be automatically added to this page once they have been sent back to UKEF.');

      correctionHistory.correctionsTextLine1().should('not.exist');
      correctionHistory.correctionsTextLine2().should('not.exist');
    });
  });

  context('When there are are completed corrections', () => {
    const completedCorrectionDetails = {
      exporter: 'Exporter A',
      reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
      formattedReasons: 'Facility ID is incorrect, Other',
      dateReceived: new Date('2024-02-07'),
      formattedDateSent: '07 Feb 2024',
      previousValues: {
        facilityId: '11111111',
      },
      formattedPreviousValues: '11111111, -',
      correctedValues: {
        facilityId: '22222222',
      },
      formattedCorrectedValues: '22222222, -',
      bankCommentary: 'Some bank commentary %$£%&^@&^',
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

        const feeRecordPendingCorrection = FeeRecordEntityMockBuilder.forReport(report)
          .withId(1)
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withExporter(completedCorrectionDetails.exporter)
          .build();

        const firstFeeRecordCorrectionReceived = FeeRecordEntityMockBuilder.forReport(report)
          .withId(2)
          .withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED)
          .withExporter(completedCorrectionDetails.exporter)
          .build();

        const secondFeeRecordCorrectionReceived = FeeRecordEntityMockBuilder.forReport(report)
          .withId(3)
          .withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED)
          .withExporter('Exporter C')
          .build();

        const thirdFeeRecordCorrectionReceived = FeeRecordEntityMockBuilder.forReport(report)
          .withId(4)
          .withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED)
          .withExporter('Exporter B')
          .build();

        const pendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecordPendingCorrection, false)
          .withId(1)
          .withAdditionalInfo('This should not be displayed because this correction is pending')
          .build();

        const firstCompletedCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(firstFeeRecordCorrectionReceived, true)
          .withId(2)
          .withReasons(completedCorrectionDetails.reasons)
          .withDateReceived(completedCorrectionDetails.dateReceived)
          .withPreviousValues(completedCorrectionDetails.previousValues)
          .withCorrectedValues(completedCorrectionDetails.correctedValues)
          .withBankCommentary(completedCorrectionDetails.bankCommentary)
          .build();

        const secondCompletedCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(secondFeeRecordCorrectionReceived, true)
          .withId(3)
          .withDateReceived(new Date('2024-04-21'))
          .build();

        const thirdCompletedCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(thirdFeeRecordCorrectionReceived, true)
          .withId(4)
          .withDateReceived(new Date('2024-03-14'))
          .build();

        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
        cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [
          feeRecordPendingCorrection,
          firstFeeRecordCorrectionReceived,
          secondFeeRecordCorrectionReceived,
          thirdFeeRecordCorrectionReceived,
        ]);
        cy.task(NODE_TASKS.INSERT_FEE_RECORD_CORRECTIONS_INTO_DB, [
          pendingCorrection,
          firstCompletedCorrection,
          secondCompletedCorrection,
          thirdCompletedCorrection,
        ]);
      });

      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL(`/utilisation-reports/correction-history`));
    });

    afterEach(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    });

    it('should display page heading', () => {
      mainHeading().should('exist');
      cy.assertText(mainHeading(), 'Record correction history');
    });

    it('should display completed corrections', () => {
      // Number of rows is number of completed corrections + 1 for the header
      correctionHistory.rows().should('have.length', 2);

      cy.assertText(correctionHistory.row(1).dateSent(), completedCorrectionDetails.formattedDateSent);
      cy.assertText(correctionHistory.row(1).exporter(), completedCorrectionDetails.exporter);
      cy.assertText(correctionHistory.row(1).reasons(), completedCorrectionDetails.formattedReasons);
      cy.assertText(correctionHistory.row(1).correctRecord(), completedCorrectionDetails.formattedCorrectedValues);
      cy.assertText(correctionHistory.row(1).oldRecord(), completedCorrectionDetails.formattedPreviousValues);
      cy.assertText(correctionHistory.row(1).correctionNotes(), completedCorrectionDetails.bankCommentary);
    });

    it('should display info message to the user', () => {
      correctionHistory.correctionsTextLine1().should('exist');
      cy.assertText(correctionHistory.correctionsTextLine1(), 'Previous record correction requests are shown below.');

      correctionHistory.correctionsTextLine2().should('exist');
      cy.assertText(correctionHistory.correctionsTextLine2(), 'Records are automatically added to this page once they have been sent back to UKEF.');

      correctionHistory.noCorrectionsTextLine1().should('not.exist');
      correctionHistory.noCorrectionsTextLine2().should('not.exist');
    });

    context('When "date sent" column heading is clicked', () => {
      beforeEach(() => {
        correctionHistory.tableHeaders.dateSent().click();
      });

      it('should sort the rows by "date sent" in ascending order', () => {
        cy.assertText(correctionHistory.row(1).dateSent(), '07 Feb 2024');

        cy.assertText(correctionHistory.row(2).dateSent(), '14 Mar 2024');

        cy.assertText(correctionHistory.row(3).dateSent(), '21 Apr 2024');
      });
    });

    context('When "exporter" column heading is clicked', () => {
      beforeEach(() => {
        correctionHistory.tableHeaders.exporter().click();
      });

      it('should sort the rows by "exporter" in ascending order', () => {
        cy.assertText(correctionHistory.row(1).exporter(), 'Exporter C');

        cy.assertText(correctionHistory.row(2).exporter(), 'Exporter B');

        cy.assertText(correctionHistory.row(3).exporter(), 'Exporter A');
      });
    });
  });
});

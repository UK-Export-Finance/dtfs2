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
const { correctionLog } = require('../../../../pages');
const { mainHeading } = require('../../../../partials');

context('Correction log - Fee record correction feature flag enabled', () => {
  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
  });

  context('When there are no completed corrections', () => {
    before(() => {
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
    });

    after(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    });

    beforeEach(() => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL(`/utilisation-reports/correction-log`));
    });

    it('should display page heading', () => {
      mainHeading().should('exist');
      cy.assertText(mainHeading(), 'Record correction log');
    });

    it('should not display correction log table', () => {
      correctionLog.table().should('not.exist');
    });

    it('should display an info message explaining there are no completed record correction requests to the user', () => {
      correctionLog.noCorrectionsTextLine1().should('exist');
      cy.assertText(correctionLog.noCorrectionsTextLine1(), 'There are no previous record correction requests.');

      correctionLog.noCorrectionsTextLine2().should('exist');
      cy.assertText(correctionLog.noCorrectionsTextLine2(), 'Records will be automatically added to this page once they have been sent back to UKEF.');

      correctionLog.correctionsTextLine1().should('not.exist');
      correctionLog.correctionsTextLine2().should('not.exist');
    });
  });

  context('When there are are completed corrections', () => {
    const pendingCorrectionReportPeriod = { start: { month: 1, year: 2021 }, end: { month: 1, year: 2021 } };

    before(() => {
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
          .withExporter('An exporter')
          .build();

        const firstFeeRecordCorrectionReceived = FeeRecordEntityMockBuilder.forReport(report)
          .withId(2)
          .withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED)
          .withExporter('Exporter A')
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
          .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER])
          .withDateReceived(new Date('2024-04-07'))
          .withPreviousValues({
            facilityId: '11111111',
          })
          .withCorrectedValues({
            facilityId: '22222222',
          })
          .withBankCommentary('Some bank commentary')
          .build();

        const secondCompletedCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(secondFeeRecordCorrectionReceived, true)
          .withId(3)
          .withDateReceived(new Date('2024-03-14'))
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
    });

    after(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    });

    beforeEach(() => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL(`/utilisation-reports/correction-log`));
    });

    it('should display page heading', () => {
      mainHeading().should('exist');
      cy.assertText(mainHeading(), 'Record correction log');
    });

    it('should display expected number of completed correction rows', () => {
      // Number of rows is number of completed corrections + 1 for the header
      correctionLog.rows().should('have.length', 4);
    });

    it('should display completed correction details as row', () => {
      cy.assertText(correctionLog.row(1).dateSent(), '07 Apr 2024');
      cy.assertText(correctionLog.row(1).exporter(), 'Exporter A');
      cy.assertText(correctionLog.row(1).reasons(), 'Facility ID is incorrect, Other');
      cy.assertText(correctionLog.row(1).correctRecord(), '22222222, -');
      cy.assertText(correctionLog.row(1).oldRecord(), '11111111, -');
      cy.assertText(correctionLog.row(1).correctionNotes(), 'Some bank commentary');
    });

    it('should display info message to the user', () => {
      correctionLog.correctionsTextLine1().should('exist');
      cy.assertText(correctionLog.correctionsTextLine1(), 'Previous record correction requests are shown below.');

      correctionLog.correctionsTextLine2().should('exist');
      cy.assertText(correctionLog.correctionsTextLine2(), 'Records are automatically added to this page once they have been sent back to UKEF.');

      correctionLog.noCorrectionsTextLine1().should('not.exist');
      correctionLog.noCorrectionsTextLine2().should('not.exist');
    });

    context('When "date sent" column heading is clicked', () => {
      beforeEach(() => {
        correctionLog.tableHeaders.dateSent().click();
      });

      it('should sort the rows by "date sent" in ascending order', () => {
        cy.assertText(correctionLog.row(1).dateSent(), '14 Mar 2024');

        cy.assertText(correctionLog.row(2).dateSent(), '14 Mar 2024');

        cy.assertText(correctionLog.row(3).dateSent(), '07 Apr 2024');
      });
    });

    context('When "exporter" column heading is clicked', () => {
      beforeEach(() => {
        correctionLog.tableHeaders.exporter().click();
      });

      it('should sort the rows by "exporter" in descending order', () => {
        cy.assertText(correctionLog.row(1).exporter(), 'Exporter C');

        cy.assertText(correctionLog.row(2).exporter(), 'Exporter B');

        cy.assertText(correctionLog.row(3).exporter(), 'Exporter A');
      });
    });
  });
});

const {
  UtilisationReportEntityMockBuilder,
  PENDING_RECONCILIATION,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  FEE_RECORD_STATUS,
} = require('@ukef/dtfs2-common');
const { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } = require('../../../../../../../e2e-fixtures');
const relativeURL = require('../../../../relativeURL');
const { pendingCorrections } = require('../../../../pages');

context('Pending corrections - Fee record correction feature flag disabled', () => {
  context('Report GEF Utilisation and fees page', () => {
    before(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

      cy.task('getUserFromDbByEmail', BANK1_PAYMENT_REPORT_OFFICER1.email).then((user) => {
        const { _id, bank } = user;
        const bankId = bank.id;

        const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withUploadedByUserId(_id.toString()).withBankId(bankId).build();
        const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();
        const pendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord).withId(1).withIsCompleted(false).build();

        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
        cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
        cy.task(NODE_TASKS.INSERT_FEE_RECORD_CORRECTIONS_INTO_DB, [pendingCorrection]);
      });
    });

    after(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    });

    it('should not display any pending corrections', () => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      pendingCorrections.table().should('not.exist');
    });
  });
});

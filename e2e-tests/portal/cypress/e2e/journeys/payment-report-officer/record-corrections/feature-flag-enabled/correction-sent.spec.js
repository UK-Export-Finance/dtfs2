import {
  UtilisationReportEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  PENDING_RECONCILIATION,
  FeeRecordEntityMockBuilder,
  FEE_RECORD_STATUS,
  RECORD_CORRECTION_REASON,
  getFormattedReportPeriodWithLongMonth,
} from '@ukef/dtfs2-common';
import { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import { provideCorrection, pendingCorrections, correctionSent } from '../../../../pages';
import { mainHeading } from '../../../../partials';

context('Correction sent page - Fee record correction feature flag enabled', () => {
  context('When a correction has been provided', () => {
    const reportPeriod = { start: { month: 1, year: 2021 }, end: { month: 1, year: 2021 } };

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

        const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();

        const pendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
          .withId(3)
          .withIsCompleted(false)
          .withReasons([RECORD_CORRECTION_REASON.UTILISATION_INCORRECT])
          .build();

        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
        cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
        cy.task(NODE_TASKS.INSERT_FEE_RECORD_CORRECTIONS_INTO_DB, [pendingCorrection]);
      });

      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relative(`/utilisation-report-upload`));

      pendingCorrections.row(1).correctionLink().click();

      cy.keyboardInput(provideCorrection.utilisationInput(), '12345.67');

      // Click continue the first time to save and review.
      cy.clickContinueButton();

      // Click continue again on the review page to submit the correction.
      cy.clickContinueButton();
    });

    after(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    });

    it('should display confirmation of the record correction submission', () => {
      const expectedHeading = `${getFormattedReportPeriodWithLongMonth(reportPeriod)} record correction sent to UKEF`;

      cy.assertText(mainHeading(), expectedHeading);

      cy.assertText(correctionSent.emailText(), 'A confirmation email has been sent to:');

      cy.task('getUserFromDbByEmail', BANK1_PAYMENT_REPORT_OFFICER1.email).then((user) => {
        const { id } = user.bank;

        cy.task(NODE_TASKS.GET_ALL_BANKS).then((banks) => {
          const bank = banks.find((b) => b.id === id);

          bank.paymentOfficerTeam.emails.forEach((email) => {
            correctionSent.emailListItem(email).should('exist');
          });
        });
      });

      cy.assertText(correctionSent.ukefNotifiedText(), 'UKEF will be notified via email that a record has been updated.');
    });

    it('should redirect to the Report GEF utilisation and fees paid when continue is clicked', () => {
      cy.clickContinueButton();

      cy.assertText(mainHeading(), 'Report GEF utilisation and fees');
    });
  });
});

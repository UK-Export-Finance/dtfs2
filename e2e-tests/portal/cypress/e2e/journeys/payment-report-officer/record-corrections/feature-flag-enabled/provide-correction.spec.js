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
} from '@ukef/dtfs2-common';
import { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import { provideCorrection } from '../../../../pages';
import { correctionRequestDetails } from '../../../../partials';

context('Provide correction - Fee record correction feature flag enabled', () => {
  context('Report GEF Utilisation and fees page', () => {
    before(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    });

    after(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
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
        reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
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

      afterEach(() => {
        cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      });

      context('and when there are no reports due for upload', () => {
        context('and when a user has initiated the "provide correction" journey', () => {
          beforeEach(() => {
            cy.login(BANK1_PAYMENT_REPORT_OFFICER1);

            cy.visit(relative(`/utilisation-reports/provide-correction/${pendingCorrectionDetails.id}`));
          });

          it('should be able to view the record correction summary on the "provide correction" screen', () => {
            correctionRequestDetails.container().should('exist');

            cy.assertText(correctionRequestDetails.row.facilityId(), pendingCorrectionDetails.facilityId);
            cy.assertText(correctionRequestDetails.row.exporter(), pendingCorrectionDetails.exporter);
            cy.assertText(correctionRequestDetails.row.reportedFees(), getFormattedCurrencyAndAmount(pendingCorrectionDetails.reportedFee));
            cy.assertText(correctionRequestDetails.row.formattedReasons(), mapReasonsToDisplayValues(pendingCorrectionDetails.reasons).join(', '));
            cy.assertText(correctionRequestDetails.row.additionalInfo(), pendingCorrectionDetails.additionalInfo);
          });

          it('should be able to see only the form fields relevant to the correction request reasons', () => {
            provideCorrection.facilityIdInput().should('exist');
            provideCorrection.reportedFeeInput().should('not.exist');
            provideCorrection.reportedCurrency.container().should('exist');
            provideCorrection.utilisationInput().should('not.exist');
            provideCorrection.additionalComments.input().should('exist');
          });
        });
      });
    });
  });
});

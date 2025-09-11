const {
  PENDING_RECONCILIATION,
  FEE_RECORD_STATUS,
  REPORT_NOT_RECEIVED,
  getFormattedReportPeriodWithLongMonth,
  getNextReportPeriodForBankSchedule,
  RECORD_CORRECTION_REASON,
  CURRENCY,
} = require('@ukef/dtfs2-common');
const { UtilisationReportEntityMockBuilder, FeeRecordCorrectionEntityMockBuilder, FeeRecordEntityMockBuilder } = require('@ukef/dtfs2-common/test-helpers');
const { addMonths, format } = require('date-fns');
const { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } = require('../../../../../../../e2e-fixtures');
const relativeURL = require('../../../../relativeURL');
const { pendingCorrections, utilisationReportUpload } = require('../../../../pages');
const { mainHeading } = require('../../../../partials');
const { aliasSelector } = require('../../../../../../../support/alias-selector');

context('Pending corrections - Fee record correction feature flag enabled', () => {
  context('Report GEF Utilisation and fees page', () => {
    before(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    });

    after(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    });

    context('When there are pending corrections', () => {
      const reportedFeeIntegerValue = 66;

      const pendingCorrectionDetails = {
        facilityId: '1234',
        exporter: 'test exporter',
        additionalInfo: 'Lots of additional info %$£%&^@&^',
        reportedFee: reportedFeeIntegerValue,
        reportedCurrency: CURRENCY.JPY,
        formattedReportedFee: `${CURRENCY.JPY} ${reportedFeeIntegerValue}.00`,
        reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
        formattedReasons: 'Facility ID is incorrect, Other',
      };

      const pendingCorrectionReportPeriod = { start: { month: 1, year: 2021 }, end: { month: 1, year: 2021 } };
      const formattedPendingCorrectionReportPeriod = getFormattedReportPeriodWithLongMonth(pendingCorrectionReportPeriod);

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
            .withFeesPaidToUkefForThePeriod(pendingCorrectionDetails.reportedFee)
            .withFeesPaidToUkefForThePeriodCurrency(pendingCorrectionDetails.reportedCurrency)
            .build();

          const pendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false)
            .withId(1)
            .withAdditionalInfo(pendingCorrectionDetails.additionalInfo)
            .withReasons(pendingCorrectionDetails.reasons)
            .build();

          const completedCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, true)
            .withId(2)
            .withAdditionalInfo('This should not be displayed because this correction has been completed')
            .build();

          cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
          cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
          cy.task(NODE_TASKS.INSERT_FEE_RECORD_CORRECTIONS_INTO_DB, [pendingCorrection, completedCorrection]);
        });
      });

      afterEach(() => {
        cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      });

      context('and when another report is due for upload', () => {
        const nextDueReportPeriod = { start: { month: 1, year: 2022 }, end: { month: 2, year: 2022 } };
        const formattedNextDueReportPeriod = getFormattedReportPeriodWithLongMonth(nextDueReportPeriod);

        beforeEach(() => {
          cy.task('getUserFromDbByEmail', BANK1_PAYMENT_REPORT_OFFICER1.email).then((user) => {
            const { bank } = user;
            const bankId = bank.id;

            const report = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED)
              .withId(2)
              .withReportPeriod(nextDueReportPeriod)
              .withBankId(bankId)
              .build();

            cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
          });

          cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
          cy.visit(relativeURL('/utilisation-report-upload'));
        });

        it('should display pending corrections', () => {
          cy.assertText(mainHeading(), 'Report GEF utilisation and fees');

          cy.assertText(pendingCorrections.correctionsHeading(), 'Record correction');
          pendingCorrections.table().should('exist');

          // Number of rows is number of corrections + 1 for the header
          pendingCorrections.rows().should('have.length', 2);

          cy.assertText(pendingCorrections.row(1).facilityId(), pendingCorrectionDetails.facilityId);
          cy.assertText(pendingCorrections.row(1).exporter(), pendingCorrectionDetails.exporter);
          cy.assertText(pendingCorrections.row(1).reportedFeesPaid(), pendingCorrectionDetails.formattedReportedFee);
          cy.assertText(pendingCorrections.row(1).errorType(), pendingCorrectionDetails.formattedReasons);
          cy.assertText(pendingCorrections.row(1).errorSummary(), pendingCorrectionDetails.additionalInfo);
        });

        it('should not display utilisation report file upload', () => {
          utilisationReportUpload.utilisationReportFileInput().should('not.exist');
        });

        it('should display a message explaining when the next report can be uploaded to the user', () => {
          pendingCorrections.nextReportDueHeading().should('exist');
          cy.assertText(pendingCorrections.nextReportDueHeading(), `${formattedNextDueReportPeriod} report`);

          pendingCorrections.nextReportDueText().should('exist');
          cy.assertText(
            pendingCorrections.nextReportDueText(),
            `The ${formattedNextDueReportPeriod} report is due, but cannot be uploaded until the record corrections for the ${formattedPendingCorrectionReportPeriod} have been completed.`,
          );

          pendingCorrections.noReportDueHeading().should('not.exist');
          pendingCorrections.noReportDueText().should('not.exist');
        });
      });

      context('and when there are no reports due for upload', () => {
        const formattedNextDueReportPeriodAlias = 'formattedNextDueReportPeriod';
        const formattedUploadFromDateAlias = 'formattedUploadFromDate';

        beforeEach(() => {
          cy.task('getUserFromDbByEmail', BANK1_PAYMENT_REPORT_OFFICER1.email).then((user) => {
            const { id } = user.bank;

            cy.task(NODE_TASKS.GET_ALL_BANKS).then((banks) => {
              const bank = banks.find((b) => b.id === id);

              const reportSchedule = bank.utilisationReportPeriodSchedule;

              const nextReportPeriod = getNextReportPeriodForBankSchedule(reportSchedule, new Date());
              const formattedNextDueReportPeriod = getFormattedReportPeriodWithLongMonth(nextReportPeriod);

              cy.wrap(formattedNextDueReportPeriod).as(formattedNextDueReportPeriodAlias);

              const startOfEndMonthOfReportPeriod = new Date(nextReportPeriod.end.year, nextReportPeriod.end.month - 1, 1);
              const submissionPeriodStartDate = addMonths(startOfEndMonthOfReportPeriod, 1);
              const formattedUploadFromDate = format(submissionPeriodStartDate, 'd MMMM yyyy');

              cy.wrap(formattedUploadFromDate).as(formattedUploadFromDateAlias);
            });

            cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
            cy.visit(relativeURL('/utilisation-report-upload'));
          });
        });

        it('should display pending corrections', () => {
          cy.assertText(mainHeading(), 'Report GEF utilisation and fees');

          cy.assertText(pendingCorrections.correctionsHeading(), 'Record correction');
          pendingCorrections.table().should('exist');

          // Number of rows is number of corrections + 1 for the header
          pendingCorrections.rows().should('have.length', 2);

          cy.assertText(pendingCorrections.row(1).facilityId(), pendingCorrectionDetails.facilityId);
          cy.assertText(pendingCorrections.row(1).exporter(), pendingCorrectionDetails.exporter);
          cy.assertText(pendingCorrections.row(1).reportedFeesPaid(), pendingCorrectionDetails.formattedReportedFee);
          cy.assertText(pendingCorrections.row(1).errorType(), pendingCorrectionDetails.formattedReasons);
          cy.assertText(pendingCorrections.row(1).errorSummary(), pendingCorrectionDetails.additionalInfo);
        });

        it('should not display utilisation report file upload', () => {
          utilisationReportUpload.utilisationReportFileInput().should('not.exist');
        });

        it('should display a message explaining when the next report can be uploaded to the user', () => {
          pendingCorrections.noReportDueHeading().should('exist');
          cy.assertText(pendingCorrections.noReportDueHeading(), 'Report not currently due for upload');

          pendingCorrections.noReportDueText().should('exist');
          cy.get(aliasSelector(formattedNextDueReportPeriodAlias)).then((formattedNextDueReportPeriod) => {
            cy.get(aliasSelector(formattedUploadFromDateAlias)).then((formattedUploadFromDate) => {
              cy.assertText(pendingCorrections.noReportDueText(), `The ${formattedNextDueReportPeriod} report can be uploaded from ${formattedUploadFromDate}`);
            });
          });

          pendingCorrections.nextReportDueHeading().should('not.exist');
          pendingCorrections.nextReportDueText().should('not.exist');
        });
      });
    });
  });
});

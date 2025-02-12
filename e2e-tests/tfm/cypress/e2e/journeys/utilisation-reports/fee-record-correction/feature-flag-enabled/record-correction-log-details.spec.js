import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  FeeRecordCorrectionEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';
import relative from '../../../../relativeURL';

context('When fee record correction feature flag is enabled - record correction log details', () => {
  const bankId = '961';
  const reportId = 1;

  const bankTeamEmails = ['test1@ukexportfinance.gov.uk', 'test2@ukexportfinance.gov.uk'];
  const bankTeamEmailsSerialized = bankTeamEmails.join(',');

  const dateRequested = new Date('2024-01-02');
  const dateReceived = new Date('2024-01-03');

  const firstReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();

  const feeRecordWithToDoAmendedStatus = FeeRecordEntityMockBuilder.forReport(firstReport)
    .withId(1)
    .withFacilityId('11111111')
    .withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED)
    .build();

  const feeRecordWithPendingCorrectionStatus = FeeRecordEntityMockBuilder.forReport(firstReport)
    .withId(2)
    .withFacilityId('22222222')
    .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
    .build();

  const completedCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecordWithToDoAmendedStatus, true)
    .withId(1)
    .withReasons([RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, RECORD_CORRECTION_REASON.OTHER])
    .withPreviousValues({
      facilityUtilisation: 123.45,
    })
    .withCorrectedValues({
      facilityUtilisation: 987.65,
    })
    .withBankCommentary('Some bank commentary')
    .withBankTeamEmails(bankTeamEmailsSerialized)
    .withDateRequested(dateRequested)
    .withDateReceived(dateReceived)
    .build();

  const pendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecordWithPendingCorrectionStatus, false)
    .withId(2)
    .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
    .withBankTeamEmails(bankTeamEmailsSerialized)
    .withDateRequested(dateRequested)
    .build();

  const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([feeRecordWithToDoAmendedStatus, feeRecordWithPendingCorrectionStatus]);

  const { utilisationReportPage, feeRecordCorrectionLogDetailsPage } = pages;
  const { recordCorrectionLogContent } = utilisationReportPage.tabs;

  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORD_CORRECTION_TRANSIENT_FORM_DATA_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [firstReport]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordWithToDoAmendedStatus, feeRecordWithPendingCorrectionStatus]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORD_CORRECTIONS_INTO_DB, [completedCorrection, pendingCorrection]);

    pages.landingPage.visit();

    cy.login(USERS.PDC_RECONCILE);
  });

  beforeEach(() => {
    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${reportId}`);
    utilisationReportPage.tabs.recordCorrectionLog().click();
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  context('when a correction is pending', () => {
    beforeEach(() => {
      recordCorrectionLogContent.table.row(pendingCorrection.id).detailsLink().click();
    });

    it('should display the correct correction details', () => {
      const { detailsSummaryList } = feeRecordCorrectionLogDetailsPage;

      const expectedFormattedRequestedByUser = `${completedCorrection.requestedByUser.firstName} ${completedCorrection.requestedByUser.lastName}`;
      const expectedFormattedOldRecords = feeRecordWithPendingCorrectionStatus.facilityId;

      detailsSummaryList.container().should('exist');

      detailsSummaryList.exporter().should('contain', feeRecordWithPendingCorrectionStatus.exporter);
      detailsSummaryList.facilityId().should('contain', feeRecordWithPendingCorrectionStatus.facilityId);
      detailsSummaryList.dateSent().should('contain', '02 Jan 2024');
      detailsSummaryList.contactName().should('contain', pendingCorrection.bankTeamName);
      detailsSummaryList.requestedBy().should('contain', expectedFormattedRequestedByUser);
      detailsSummaryList.reasons().should('contain', 'Facility ID is incorrect');
      detailsSummaryList.additionalInfo().should('contain', pendingCorrection.additionalInfo);
      detailsSummaryList.oldValues().should('contain', expectedFormattedOldRecords);
      detailsSummaryList.newValues().should('contain', '-');
      detailsSummaryList.bankCommentary().should('contain', '-');
      detailsSummaryList.dateReceived().should('contain', '-');

      bankTeamEmails.forEach((email) => {
        detailsSummaryList.contactEmailAddresses().should('contain', email);
      });
    });
  });

  context('when a correction is complete', () => {
    beforeEach(() => {
      recordCorrectionLogContent.table.row(completedCorrection.id).detailsLink().click();
    });

    it('should display the correct correction details', () => {
      const { detailsSummaryList } = feeRecordCorrectionLogDetailsPage;

      const expectedFormattedRequestedByUser = `${completedCorrection.requestedByUser.firstName} ${completedCorrection.requestedByUser.lastName}`;
      const expectedFormattedOldRecords = `${completedCorrection.previousValues.facilityUtilisation}, -`;
      const expectedFormattedCorrectRecords = `${completedCorrection.correctedValues.facilityUtilisation}, -`;

      detailsSummaryList.container().should('exist');

      detailsSummaryList.exporter().should('contain', feeRecordWithToDoAmendedStatus.exporter);
      detailsSummaryList.facilityId().should('contain', feeRecordWithToDoAmendedStatus.facilityId);
      detailsSummaryList.dateSent().should('contain', '02 Jan 2024');
      detailsSummaryList.contactName().should('contain', completedCorrection.bankTeamName);
      detailsSummaryList.requestedBy().should('contain', expectedFormattedRequestedByUser);
      detailsSummaryList.reasons().should('contain', 'Utilisation is incorrect, Other');
      detailsSummaryList.additionalInfo().should('contain', completedCorrection.additionalInfo);
      detailsSummaryList.oldValues().should('contain', expectedFormattedOldRecords);
      detailsSummaryList.newValues().should('contain', expectedFormattedCorrectRecords);
      detailsSummaryList.bankCommentary().should('contain', completedCorrection.bankCommentary);
      detailsSummaryList.dateReceived().should('contain', '03 Jan 2024');

      bankTeamEmails.forEach((email) => {
        detailsSummaryList.contactEmailAddresses().should('contain', email);
      });
    });
  });

  context('when user clicks back on the "record correction log details" screen', () => {
    beforeEach(() => {
      recordCorrectionLogContent.table.row(pendingCorrection.id).detailsLink().click();

      cy.clickBackLink();
    });

    it('should return to the "record correction log" tab', () => {
      cy.url().should('eq', relative(`/utilisation-reports/${reportId}#record-correction-log`));
    });
  });
});

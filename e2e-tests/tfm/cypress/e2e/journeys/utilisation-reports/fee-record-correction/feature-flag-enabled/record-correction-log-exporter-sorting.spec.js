import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from "@ukef/dtfs2-common/test-helpers";
import { PENDING_RECONCILIATION, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

const bankId = '961';
const reportId = 1;

const exporters = ['Exporter 101', 'Exporter 113', 'Exporter 102', 'Exporter 104', 'Exporter 106', 'Exporter 105', 'Exporter 117', 'Exporter 190'];

const firstReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();

const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(1).withExporter(exporters[0]).build();

const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(2).withExporter(exporters[0]).build();

const thirdFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(3).withExporter(exporters[1]).build();

const fourthFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(4).withExporter(exporters[2]).build();

const fifthFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(5).withExporter(exporters[3]).build();

const sixthFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(6).withExporter(exporters[4]).build();

const eighthFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(7).withExporter(exporters[6]).build();

const ninthFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(8).withExporter(exporters[0]).build();

const tenthFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(9).withExporter(exporters[7]).build();

const seventhFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(10).withExporter(exporters[5]).build();

const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([
  firstFeeRecord,
  secondFeeRecord,
  thirdFeeRecord,
  fourthFeeRecord,
  fifthFeeRecord,
  sixthFeeRecord,
  seventhFeeRecord,
  eighthFeeRecord,
  ninthFeeRecord,
  tenthFeeRecord,
]);

const { recordCorrectionLogContent } = pages.utilisationReportPage.tabs;
const { utilisationReportPage } = pages;
const { table } = recordCorrectionLogContent;

const additionalInfoUserInput = 'Some additional info';

context('When fee record correction feature flag is enabled - record correction log table sorting by exporter', () => {
  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORD_CORRECTION_TRANSIENT_FORM_DATA_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [firstReport]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [
      firstFeeRecord,
      secondFeeRecord,
      thirdFeeRecord,
      fourthFeeRecord,
      fifthFeeRecord,
      sixthFeeRecord,
      seventhFeeRecord,
      eighthFeeRecord,
      ninthFeeRecord,
      tenthFeeRecord,
    ]);

    pages.landingPage.visit();

    cy.login(USERS.PDC_RECONCILE);

    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: firstFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
    });

    cy.login(USERS.PDC_RECONCILE);

    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: secondFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT],
    });

    cy.login(USERS.PDC_RECONCILE);

    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: thirdFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT],
    });

    cy.login(USERS.PDC_RECONCILE);

    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: fourthFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT],
    });

    cy.login(USERS.PDC_RECONCILE);

    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: fifthFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT],
    });

    cy.login(USERS.PDC_RECONCILE);

    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: sixthFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT],
    });

    cy.login(USERS.PDC_RECONCILE);

    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: seventhFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT],
    });

    cy.login(USERS.PDC_RECONCILE);

    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: eighthFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT],
    });

    cy.login(USERS.PDC_RECONCILE);

    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: ninthFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT],
    });

    cy.login(USERS.PDC_RECONCILE);

    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: tenthFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT],
    });
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

  describe('ascending order', () => {
    it('should display the exporter rows in ascending order', () => {
      table.exporterHeader().find('button').click();

      cy.checkRecordCorrectionRowExporterWithoutId(0, exporters[0]);
      cy.checkRecordCorrectionRowExporterWithoutId(1, exporters[0]);
      cy.checkRecordCorrectionRowExporterWithoutId(2, exporters[0]);
      cy.checkRecordCorrectionRowExporterWithoutId(3, exporters[2]);
      cy.checkRecordCorrectionRowExporterWithoutId(4, exporters[3]);
      cy.checkRecordCorrectionRowExporterWithoutId(5, exporters[5]);
      cy.checkRecordCorrectionRowExporterWithoutId(6, exporters[4]);
      cy.checkRecordCorrectionRowExporterWithoutId(7, exporters[1]);
      cy.checkRecordCorrectionRowExporterWithoutId(8, exporters[6]);
      cy.checkRecordCorrectionRowExporterWithoutId(9, exporters[7]);
    });
  });

  describe('descending order', () => {
    it('should display the exporter rows in descending order', () => {
      // press header twice to sort in descending order
      table.exporterHeader().find('button').click();
      table.exporterHeader().find('button').click();

      cy.checkRecordCorrectionRowExporterWithoutId(0, exporters[7]);
      cy.checkRecordCorrectionRowExporterWithoutId(1, exporters[6]);
      cy.checkRecordCorrectionRowExporterWithoutId(2, exporters[1]);
      cy.checkRecordCorrectionRowExporterWithoutId(3, exporters[4]);
      cy.checkRecordCorrectionRowExporterWithoutId(4, exporters[5]);
      cy.checkRecordCorrectionRowExporterWithoutId(5, exporters[3]);
      cy.checkRecordCorrectionRowExporterWithoutId(6, exporters[2]);
      cy.checkRecordCorrectionRowExporterWithoutId(7, exporters[0]);
      cy.checkRecordCorrectionRowExporterWithoutId(8, exporters[0]);
      cy.checkRecordCorrectionRowExporterWithoutId(9, exporters[0]);
    });
  });
});

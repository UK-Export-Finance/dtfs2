import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
  RECORD_CORRECTION_REASON,
} from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { today } from '../../../../../../../e2e-fixtures/dateConstants';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

const bankId = '961';
const reportId = 1;

const firstReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();

const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build();
const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(2).withFacilityId('987654321').withStatus(FEE_RECORD_STATUS.TO_DO).build();

const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([firstFeeRecord, secondFeeRecord]);

const { recordCorrectionLogTab } = pages.utilisationReportPage;
const { utilisationReportPage } = pages;
const { table } = recordCorrectionLogTab;

const additionalInfoUserInput = 'Some additional info';

context('When fee record correction feature flag is enabled', () => {
  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORD_CORRECTION_TRANSIENT_FORM_DATA_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [firstReport]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [firstFeeRecord, secondFeeRecord]);

    pages.landingPage.visit();

    cy.login(USERS.PDC_RECONCILE);

    cy.createAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: firstFeeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
    });

    cy.login(USERS.PDC_RECONCILE);

    cy.createAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord: secondFeeRecord,
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

  it('should display the record correction log table', () => {
    recordCorrectionLogTab.recordCorrectionLogTable().should('exist');
    recordCorrectionLogTab.recordCorrectionLogTable().should('be.visible');
  });

  it('should display the correct table headers', () => {
    cy.assertText(table.facilityIdHeader(), 'Facility ID');
    cy.assertText(table.exporterHeader(), 'Exporter');
    cy.assertText(table.reasonsHeader(), 'Reason for record correction');
    cy.assertText(table.dateSentHeader(), 'Date sent');
    cy.assertText(table.requestedByHeader(), 'Requested by');
    cy.assertText(table.statusHeader(), 'Status');
  });

  it('should only have 2 rows in the table', () => {
    recordCorrectionLogTab.recordCorrectionLogTable().find('tr[data-cy^="record-correction-log-table-row-"]').should('have.length', 2);
  });

  it('should display the correct values for the first row', () => {
    cy.task(NODE_TASKS.GET_FEE_RECORD_FROM_DB_BY_ID, firstFeeRecord.id).then((feeRecord) => {
      cy.checkRecordCorrectionLogTableRowValues({
        feeRecord,
        reasons: 'Facility ID is incorrect, Other',
        dateSent: today.dd_MMM_yyyy,
        requestedBy: `${USERS.PDC_RECONCILE.firstName} ${USERS.PDC_RECONCILE.lastName}`,
        status: 'Record correction sent',
      });
    });
  });

  it('should display the correct values for the second row', () => {
    cy.task(NODE_TASKS.GET_FEE_RECORD_FROM_DB_BY_ID, secondFeeRecord.id).then((feeRecord) => {
      cy.checkRecordCorrectionLogTableRowValues({
        feeRecord,
        reasons: 'Reported fee is incorrect',
        dateSent: today.dd_MMM_yyyy,
        requestedBy: `${USERS.PDC_RECONCILE.firstName} ${USERS.PDC_RECONCILE.lastName}`,
        status: 'Record correction sent',
      });
    });
  });
});

import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  getFormattedMonetaryValue,
  FeeRecordCorrectionEntityMockBuilder,
  CURRENCY,
} from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { today } from '../../../../../../../e2e-fixtures/dateConstants';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

const bankId = '961';
const reportId = 1;
const fee = 50000;
const correctionId1 = 1;
const correctionId2 = 2;
const secondFacilityId = '987654321';

const firstReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();

const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED).build();
const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(firstReport)
  .withId(2)
  .withFacilityId(secondFacilityId)
  .withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED)
  .withFeesPaidToUkefForThePeriod(fee)
  .build();

const correctionEntity1 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(firstFeeRecord, true)
  .withId(correctionId1)
  .withReasons([
    RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
    RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
    RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
    RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
    RECORD_CORRECTION_REASON.OTHER,
  ])
  .withPreviousValues({
    facilityUtilisation: 600000,
    feesPaidToUkefForThePeriod: 12345,
    feesPaidToUkefForThePeriodCurrency: CURRENCY.GBP,
    facilityId: firstFeeRecord.facilityId,
  })
  .withCorrectedValues({
    facilityUtilisation: 100000,
    feesPaidToUkefForThePeriod: 1111,
    feesPaidToUkefForThePeriodCurrency: CURRENCY.JPY,
    facilityId: '654321',
  })
  .build();

const correctionEntity2 = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(secondFeeRecord, true)
  .withId(correctionId2)
  .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT])
  .withPreviousValues({
    facilityUtilisation: null,
    feesPaidToUkefForThePeriod: null,
    feesPaidToUkefForThePeriodCurrency: null,
    facilityId: secondFacilityId,
  })
  .withCorrectedValues({
    facilityUtilisation: null,
    feesPaidToUkefForThePeriod: null,
    feesPaidToUkefForThePeriodCurrency: null,
    facilityId: '654321',
  })
  .build();

const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([firstFeeRecord, secondFeeRecord]);

const { recordCorrectionLogContent } = pages.utilisationReportPage.tabs;
const { utilisationReportPage } = pages;

context('When fee record correction feature flag is enabled - record correction log with correct records', () => {
  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORD_CORRECTION_TRANSIENT_FORM_DATA_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [firstReport]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [firstFeeRecord, secondFeeRecord]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORD_CORRECTIONS_INTO_DB, [correctionEntity1, correctionEntity2]);

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

  it('should display the record correction log table', () => {
    recordCorrectionLogContent.recordCorrectionLogTable().should('exist');
    recordCorrectionLogContent.recordCorrectionLogTable().should('be.visible');
  });

  it('should have one row per correction in the table', () => {
    recordCorrectionLogContent.recordCorrectionLogTable().find('tr[data-cy^="record-correction-log-table-row-"]').should('have.length', 2);
  });

  it('should display the correct values for the first row', () => {
    cy.task(NODE_TASKS.GET_FEE_RECORD_FROM_DB_BY_ID, firstFeeRecord.id).then((feeRecord) => {
      cy.checkRecordCorrectionLogTableRowValues({
        feeRecord,
        reasons: 'Facility ID is incorrect, Reported currency is incorrect, Reported fee is incorrect, Utilisation is incorrect, Other',
        dateSent: today.dd_MMM_yyyy,
        correctRecord: `${correctionEntity1.correctedValues.facilityId}, ${
          correctionEntity1.correctedValues.feesPaidToUkefForThePeriodCurrency
        }, ${getFormattedMonetaryValue(correctionEntity1.correctedValues.feesPaidToUkefForThePeriod)}, ${getFormattedMonetaryValue(
          correctionEntity1.correctedValues.facilityUtilisation,
        )}, -`,
        oldRecord: `${correctionEntity1.previousValues.facilityId}, ${
          correctionEntity1.previousValues.feesPaidToUkefForThePeriodCurrency
        }, ${getFormattedMonetaryValue(correctionEntity1.previousValues.feesPaidToUkefForThePeriod)}, ${getFormattedMonetaryValue(
          correctionEntity1.previousValues.facilityUtilisation,
        )}, -`,
        status: 'Record correction received',
      });
    });
  });

  it('should display the correct values for the second row', () => {
    cy.task(NODE_TASKS.GET_FEE_RECORD_FROM_DB_BY_ID, secondFeeRecord.id).then((feeRecord) => {
      cy.checkRecordCorrectionLogTableRowValues({
        feeRecord,
        reasons: 'Facility ID is incorrect',
        dateSent: today.dd_MMM_yyyy,
        correctRecord: correctionEntity2.correctedValues.facilityId,
        oldRecord: correctionEntity2.previousValues.facilityId,
        status: 'Record correction received',
      });
    });
  });
});

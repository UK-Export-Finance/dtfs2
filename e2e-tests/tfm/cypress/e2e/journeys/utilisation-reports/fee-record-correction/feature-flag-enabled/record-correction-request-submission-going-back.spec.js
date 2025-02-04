import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
  RECORD_CORRECTION_REASON,
} from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';
import { mainHeading } from '../../../../partials';
import relative from '../../../../relativeURL';

const bankId = '961';
const reportId = 1;

const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();

const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build();

const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords([feeRecord]);

const { utilisationReportPageNotFoundPage } = pages;

const additionalInfoUserInput = 'Some additional info';

context('Pressing the back button after a record correction request is submitted', () => {
  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORD_CORRECTION_TRANSIENT_FORM_DATA_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
  });

  beforeEach(() => {
    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    // submit a record correction request
    cy.completeAndSubmitFeeRecordCorrectionRequestForm({
      feeRecord,
      reportId,
      additionalInfoUserInput,
      reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
    });

    // press browser back button
    cy.go('back');
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  it('should show the "Page not found" page when pressing the browser back button after a record correction request is submitted', () => {
    cy.assertText(mainHeading(), 'Page not found');
    cy.assertText(
      utilisationReportPageNotFoundPage.reason(),
      'The record correction request has been sent to the bank. You cannot make any changes to the request',
    );
    cy.assertText(utilisationReportPageNotFoundPage.returnToPremiumPaymentsButton(), 'Return to premium payments');

    utilisationReportPageNotFoundPage.returnToPremiumPaymentsButton().click();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));
  });
});

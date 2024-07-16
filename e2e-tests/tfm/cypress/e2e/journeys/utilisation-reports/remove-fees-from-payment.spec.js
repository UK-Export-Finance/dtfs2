import {
  CURRENCY,
  FacilityUtilisationDataEntityMockBuilder,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import { PDC_TEAMS } from '../../../fixtures/teams';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import USERS from '../../../fixtures/users';
import relative from '../../relativeURL';

context(`${PDC_TEAMS.PDC_RECONCILE} users can remove fees from payments`, () => {
  const reportId = 12;
  const paymentId = 15;
  const paymentCurrency = CURRENCY.GBP;
  const paymentAmount = 100;

  const paymentDateDay = '1';
  const paymentDateMonth = '1';
  const paymentDateYear = '2024';
  const datePaymentReceived = new Date(`${paymentDateYear}-${paymentDateMonth}-${paymentDateDay}`);
  const paymentReference = 'A payment reference';

  const feeRecordIds = [1, 2];

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId('961')
    .withDateUploaded(new Date())
    .build();

  const aPaymentWithAmount = (amount) =>
    PaymentEntityMockBuilder.forCurrency(paymentCurrency)
      .withId(paymentId)
      .withAmount(amount)
      .withDateReceived(datePaymentReceived)
      .withReference(paymentReference)
      .build();

  const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId('12345678').build();

  const aFeeRecordWithAmountStatusAndPayments = (id, amount, status, payments) =>
    FeeRecordEntityMockBuilder.forReport(utilisationReport)
      .withId(id)
      .withFacilityUtilisationData(facilityUtilisationData)
      .withStatus(status)
      .withFeesPaidToUkefForThePeriod(amount)
      .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
      .withPaymentCurrency(paymentCurrency)
      .withPayments(payments)
      .build();

  const getFeeRecordCheckbox = (feeRecordId) => cy.get(`[type="checkbox"][id="feeRecordId-${feeRecordId}"]`);

  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.INSERT_FACILITY_UTILISATION_DATA_INTO_DB, [facilityUtilisationData]);
  });

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [utilisationReport]);

    const payment = aPaymentWithAmount(paymentAmount);

    const feeRecords = feeRecordIds.map((id) => aFeeRecordWithAmountStatusAndPayments(id, paymentAmount, FEE_RECORD_STATUS.MATCH, [payment]));
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
  });

  it('should display errors when form submitted with invalid fee selections and persist the selected fees', () => {
    pages.utilisationReportEditPaymentPage.clickRemoveSelectedPaymentsButton();
    pages.utilisationReportEditPaymentPage.errorSummary().contains('Select fee or fees to remove from the payment');

    feeRecordIds.forEach((feeRecordId) => {
      getFeeRecordCheckbox(feeRecordId).check();
    });
    pages.utilisationReportEditPaymentPage.clickRemoveSelectedPaymentsButton();
    pages.utilisationReportEditPaymentPage.errorSummary().contains('You cannot remove all the fees. Delete the payment instead.');
    feeRecordIds.forEach((feeRecordId) => {
      getFeeRecordCheckbox(feeRecordId).should('be.checked');
    });
  });

  it('should remove the selected fees from the payment after clicking the remove selected fees button', () => {
    const getFeeRecordRow = (feeRecordId) => cy.get(`tbody tr[data-cy="fee-record-details-table-row--feeRecordId-${feeRecordId}"]`);
    const [feeRecordIdToRemove, ...otherFeeRecordIds] = feeRecordIds;

    getFeeRecordCheckbox(feeRecordIdToRemove).check();
    pages.utilisationReportEditPaymentPage.clickRemoveSelectedPaymentsButton();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`));

    getFeeRecordRow(feeRecordIdToRemove).should('not.exist');
    otherFeeRecordIds.forEach((feeRecordId) => {
      getFeeRecordRow(feeRecordId).should('exist');
    });
  });

  it(`should update the fee record status if another fee has been removed from the payment group`, () => {
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORDS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);

    const payment = aPaymentWithAmount(200);
    const feeRecords = [
      aFeeRecordWithAmountStatusAndPayments(1, 190, FEE_RECORD_STATUS.MATCH, [payment]),
      aFeeRecordWithAmountStatusAndPayments(2, 10, FEE_RECORD_STATUS.MATCH, [payment]),
    ];
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

    cy.visit(`/utilisation-reports/${reportId}`);

    cy.get('strong[data-cy="fee-record-status"]:contains("MATCH")').should('exist');
    pages.utilisationReportPage.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`));

    getFeeRecordCheckbox(1).check();
    pages.utilisationReportEditPaymentPage.clickRemoveSelectedPaymentsButton();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`));

    cy.visit(`/utilisation-reports/${reportId}`);
    cy.get('strong[data-cy="fee-record-status"]:contains("DOES NOT MATCH")').should('exist');
  });
});

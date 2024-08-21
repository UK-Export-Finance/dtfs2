import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { PDC_TEAMS } from '../../../fixtures/teams';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import relative from '../../relativeURL';

context(`${PDC_TEAMS.PDC_RECONCILE} users can add fee records to existing payments`, () => {
  const REPORT_ID = 1;
  const PAYMENT_ID_ONE = '1';
  const FEE_RECORD_ID_ONE = '11';
  const FEE_RECORD_ID_TWO = '22';
  const PAYMENT_CURRENCY = 'GBP';

  const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
    .withId(REPORT_ID)
    .withBankId('961')
    .build();

  const firstPayment = PaymentEntityMockBuilder.forCurrency(PAYMENT_CURRENCY)
    .withAmount(450)
    .withDateReceived(new Date('2023-02-02'))
    .withId(PAYMENT_ID_ONE)
    .withReference('REF00001')
    .build();
  const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
    .withId(FEE_RECORD_ID_ONE)
    .withFacilityId('11111111')
    .withExporter('Exporter 1')
    .withPaymentCurrency(PAYMENT_CURRENCY)
    .withFeesPaidToUkefForThePeriod(100)
    .withFeesPaidToUkefForThePeriodCurrency('JPY')
    .withPaymentExchangeRate(2)
    .withStatus('TO_DO')
    .build();
  const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
    .withId(FEE_RECORD_ID_TWO)
    .withFacilityId('22222222')
    .withExporter('Exporter 2')
    .withPaymentCurrency(PAYMENT_CURRENCY)
    .withFeesPaidToUkefForThePeriod(200)
    .withFeesPaidToUkefForThePeriodCurrency('EUR')
    .withPaymentExchangeRate(0.5)
    .withPayments([firstPayment])
    .withStatus('DOES_NOT_MATCH')
    .build();

  before(() => {
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  afterEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);
  });

  const navigateToAddToExistingPaymentScreenForFirstFeeRecord = () => {
    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);
    getFeeRecordCheckbox([FEE_RECORD_ID_ONE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).check();

    cy.get('[type="submit"]').contains('Add a payment').click();
    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/add-payment`));

    cy.get('[type="submit"]').contains('Add reported fee to an existing payment').click();
    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/add-to-an-existing-payment`));
  };

  describe('when there is one payment group', () => {
    beforeEach(() => {
      cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
      cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [firstFeeRecord, secondFeeRecord]);

      navigateToAddToExistingPaymentScreenForFirstFeeRecord();
    });

    it('should automatically select the first payment group when there is only one group to choose from', () => {
      pages.utilisationReportAddToAnExistingPaymentPage
        .availablePaymentGroups()
        .should('contain', 'There is one existing payment that the reported fees will be added to');

      pages.utilisationReportAddToAnExistingPaymentPage.continueButton().click();

      pages.utilisationReportPage.premiumPaymentsTab.getPaymentLink(PAYMENT_ID_ONE).should('contain', 'GBP 450.00');
      pages.utilisationReportPage.premiumPaymentsTab.getPremiumPaymentsTableRow(FEE_RECORD_ID_ONE).should('contain', 'MATCH');
    });
  });

  describe('when there are multiple payment groups', () => {
    beforeEach(() => {
      const PAYMENT_ID_TWO = '2';
      const FEE_RECORD_ID_THREE = '33';
      const secondPayment = PaymentEntityMockBuilder.forCurrency(PAYMENT_CURRENCY)
        .withAmount(100)
        .withDateReceived(new Date('2023-02-02'))
        .withId(PAYMENT_ID_TWO)
        .withReference('REF00002')
        .build();
      const thirdFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
        .withId(FEE_RECORD_ID_THREE)
        .withFacilityId('33333333')
        .withExporter('Exporter 3')
        .withPaymentCurrency(PAYMENT_CURRENCY)
        .withFeesPaidToUkefForThePeriod(300)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentExchangeRate(0.5)
        .withPayments([secondPayment])
        .withStatus('DOES_NOT_MATCH')
        .build();

      cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
      cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [firstFeeRecord, secondFeeRecord, thirdFeeRecord]);

      navigateToAddToExistingPaymentScreenForFirstFeeRecord();
    });

    it('should render the selected fee records, render the available payments, and add fees to the payments', () => {
      pages.utilisationReportAddToAnExistingPaymentPage.selectedReportedFeesDetailsTable().should('contain', '11111111');
      pages.utilisationReportAddToAnExistingPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'Exporter 1');
      pages.utilisationReportAddToAnExistingPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'JPY 100');
      pages.utilisationReportAddToAnExistingPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'GBP 50');
      pages.utilisationReportAddToAnExistingPaymentPage.selectedReportedFeesDetailsTable().contains('Total reported payments GBP 50').should('exist');

      pages.utilisationReportAddToAnExistingPaymentPage.availablePaymentGroups().should('exist');
      pages.utilisationReportAddToAnExistingPaymentPage.availablePaymentGroups().should('contain', 'GBP 450.00');
      pages.utilisationReportAddToAnExistingPaymentPage.availablePaymentGroups().should('contain', 'Payment reference: REF00001');

      pages.utilisationReportAddToAnExistingPaymentPage.paymentGroupRadioButton(`paymentIds-${PAYMENT_ID_ONE}`).click();

      pages.utilisationReportAddToAnExistingPaymentPage.continueButton().click();

      pages.utilisationReportPage.premiumPaymentsTab.getPaymentLink(PAYMENT_ID_ONE).should('contain', 'GBP 450.00');
      pages.utilisationReportPage.premiumPaymentsTab.getPremiumPaymentsTableRow(FEE_RECORD_ID_ONE).should('contain', 'MATCH');
    });

    it('should display an error message when there are multiple payments to choose from and none have been selected', () => {
      pages.utilisationReportAddToAnExistingPaymentPage.continueButton().click();

      pages.utilisationReportAddToAnExistingPaymentPage.errorSummary().contains('Select a payment to add the fee or fees to');
    });
  });

  it('should add the selected fees to the payments and update the fee record status after clicking the continue button', () => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [firstFeeRecord, secondFeeRecord]);

    navigateToAddToExistingPaymentScreenForFirstFeeRecord();

    pages.utilisationReportAddToAnExistingPaymentPage.continueButton().click();

    pages.utilisationReportPage.premiumPaymentsTab.getPaymentLink(PAYMENT_ID_ONE).should('contain', 'GBP 450.00');
    pages.utilisationReportPage.premiumPaymentsTab.getPremiumPaymentsTableRow(FEE_RECORD_ID_ONE).should('contain', 'MATCH');
  });

  it('should redirect the user to the premium payments page when user clicks the back or cancel links and persist the selected fees', () => {
    const FEE_RECORD_ID_THREE = '33';
    const FEE_RECORD_ID_FOUR = '44';
    const thirdFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withId(FEE_RECORD_ID_THREE)
      .withFacilityId('33333333')
      .withExporter('Exporter 3')
      .withPaymentCurrency(PAYMENT_CURRENCY)
      .withFeesPaidToUkefForThePeriod(300)
      .withFeesPaidToUkefForThePeriodCurrency('EUR')
      .withPaymentExchangeRate(0.5)
      .withStatus('TO_DO')
      .build();
    const fourthFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withId(FEE_RECORD_ID_FOUR)
      .withFacilityId('44444444')
      .withExporter('Exporter 4')
      .withPaymentCurrency(PAYMENT_CURRENCY)
      .withFeesPaidToUkefForThePeriod(400)
      .withFeesPaidToUkefForThePeriodCurrency('EUR')
      .withPaymentExchangeRate(0.5)
      .withPayments([firstPayment])
      .withStatus('DOES_NOT_MATCH')
      .build();

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [firstFeeRecord, secondFeeRecord, thirdFeeRecord, fourthFeeRecord]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);
    getFeeRecordCheckbox([FEE_RECORD_ID_ONE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).check();
    getFeeRecordCheckbox([FEE_RECORD_ID_THREE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).check();

    cy.get('[type="submit"]').contains('Add a payment').click();
    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/add-payment`));
    cy.get('[type="submit"]').contains('Add reported fees to an existing payment').click();
    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/add-to-an-existing-payment`));

    pages.utilisationReportAddToAnExistingPaymentPage.backLink().click();
    getFeeRecordCheckbox([FEE_RECORD_ID_ONE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).should('be.checked');
    getFeeRecordCheckbox([FEE_RECORD_ID_THREE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).should('be.checked');
    getFeeRecordCheckbox([FEE_RECORD_ID_TWO, FEE_RECORD_ID_FOUR], PAYMENT_CURRENCY, FEE_RECORD_STATUS.DOES_NOT_MATCH).should('not.be.checked');

    cy.get('[type="submit"]').contains('Add a payment').click();
    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/add-payment`));
    cy.get('[type="submit"]').contains('Add reported fees to an existing payment').click();
    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/add-to-an-existing-payment`));

    pages.utilisationReportAddToAnExistingPaymentPage.cancelLink().click();
    getFeeRecordCheckbox([FEE_RECORD_ID_ONE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).should('be.checked');
    getFeeRecordCheckbox([FEE_RECORD_ID_THREE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).should('be.checked');
    getFeeRecordCheckbox([FEE_RECORD_ID_TWO, FEE_RECORD_ID_FOUR], PAYMENT_CURRENCY, FEE_RECORD_STATUS.DOES_NOT_MATCH).should('not.be.checked');
  });

  function getFeeRecordCheckbox(feeRecordIds, paymentCurrency, status) {
    return cy.get(`[type="checkbox"][id="feeRecordIds-${feeRecordIds.join(',')}-reportedPaymentsCurrency-${paymentCurrency}-status-${status}"]`);
  }
});

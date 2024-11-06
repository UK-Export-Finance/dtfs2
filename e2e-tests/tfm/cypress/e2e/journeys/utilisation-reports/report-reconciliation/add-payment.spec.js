import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  PaymentMatchingToleranceEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
  PENDING_RECONCILIATION,
  CURRENCY,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import relative from '../../../relativeURL';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context('PDC_RECONCILE users can add a payment to a report', () => {
  const GBP_TOLERANCE = 2;
  const BANK_ID = '961';
  const REPORT_ID = 1;
  const FEE_RECORD_ID_ONE = '11';
  const FEE_RECORD_ID_TWO = '22';
  const PAYMENT_CURRENCY = 'GBP';

  const resetTolerances = () => {
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENT_MATCHING_TOLERANCES_FROM_DB);
    cy.task(NODE_TASKS.INSERT_PAYMENT_MATCHING_TOLERANCES_INTO_DB, [
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('GBP').withThreshold(GBP_TOLERANCE).withIsActive(true).withId(1).build(),
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('EUR').withThreshold(0).withIsActive(true).withId(2).build(),
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('JPY').withThreshold(0).withIsActive(true).withId(3).build(),
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('USD').withThreshold(0).withIsActive(true).withId(4).build(),
    ]);
  };

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(REPORT_ID).withBankId(BANK_ID).build();

  const payment = PaymentEntityMockBuilder.forCurrency(PAYMENT_CURRENCY)
    .withAmount(60)
    .withDateReceived(new Date('2023-02-02'))
    .withReference('REF01234')
    .build();
  const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report)
    .withId(FEE_RECORD_ID_ONE)
    .withFacilityId('11111111')
    .withExporter('Exporter 1')
    .withPaymentCurrency(PAYMENT_CURRENCY)
    .withFeesPaidToUkefForThePeriod(100)
    .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.JPY)
    .withPaymentExchangeRate(2)
    .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
    .withPayments([payment])
    .build();
  const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report)
    .withId(FEE_RECORD_ID_TWO)
    .withFacilityId('22222222')
    .withExporter('Exporter 2')
    .withFeesPaidToUkefForThePeriod(200)
    .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.EUR)
    .withPaymentCurrency(PAYMENT_CURRENCY)
    .withPaymentExchangeRate(0.5)
    .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
    .withPayments([payment])
    .build();

  const { premiumPaymentsTab } = pages.utilisationReportPage;
  const { premiumPaymentsTable } = premiumPaymentsTab;
  const { selectedReportedFeesDetailsTable, recordedPaymentsDetailsTable, insetToleranceText } = pages.utilisationReportAddPaymentPage;

  beforeEach(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
    resetTolerances();

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

    const feeRecords = [feeRecordOne, feeRecordTwo];
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);

    premiumPaymentsTable.checkbox([FEE_RECORD_ID_ONE, FEE_RECORD_ID_TWO], PAYMENT_CURRENCY, FEE_RECORD_STATUS.DOES_NOT_MATCH).click();

    cy.get('[type="submit"]').contains('Add a payment').click();
  });

  it('should render the add a payment page', () => {
    cy.get('h1').invoke('text').should('contain', 'Add a payment');
  });

  it('should render the selected fee record details', () => {
    selectedReportedFeesDetailsTable().should('contain', '11111111');
    selectedReportedFeesDetailsTable().should('contain', 'Exporter 1');
    selectedReportedFeesDetailsTable().should('contain', 'JPY 100');
    selectedReportedFeesDetailsTable().should('contain', 'GBP 50');

    selectedReportedFeesDetailsTable().should('contain', '22222222');
    selectedReportedFeesDetailsTable().should('contain', 'Exporter 2');
    selectedReportedFeesDetailsTable().should('contain', 'EUR 200');
    selectedReportedFeesDetailsTable().should('contain', 'GBP 400');

    selectedReportedFeesDetailsTable().contains('Total reported payments GBP 450').should('exist');
  });

  it('should render the recorded payment details table', () => {
    recordedPaymentsDetailsTable().should('contain', 'GBP 60');
    recordedPaymentsDetailsTable().should('contain', '2 Feb 2023');
    recordedPaymentsDetailsTable().should('contain', 'REF01234');
  });

  it('should render the inset text explaining tolerances', () => {
    insetToleranceText().should('exist');
    cy.assertText(
      insetToleranceText(),
      `Tolerances of £${GBP_TOLERANCE} or equivalent are applied. You cannot add any additional payments to the record if it is taken to a match status as a result of tolerance.`,
    );
  });

  it('should display errors when form submitted with invalid values', () => {
    cy.keyboardInput(cy.getInputByLabelText('Amount received'), '100');

    cy.completeDateFormFields({ idPrefix: 'payment-date', day: '56', month: '12', year: '2023' });

    cy.clickContinueButton();

    cy.get('a').should('contain', 'Select payment currency');
    cy.get('a').should('contain', 'The date payment received must be a real date');
    cy.get('a').should('contain', 'Select add another payment choice');

    cy.get('form').should('contain', 'Select payment currency');
    cy.get('form').should('contain', 'The date payment received must be a real date');
    cy.get('form').should('contain', 'Select add another payment choice');

    cy.getInputByLabelText('Amount received').should('have.value', '100');
    cy.getInputByLabelText('Day').should('have.value', '56');
    cy.getInputByLabelText('Month').should('have.value', '12');
    cy.getInputByLabelText('Year').should('have.value', '2023');
  });

  it('submits form and redirects to premium payments page when user submits form with valid values and user selects no to adding another payment', () => {
    cy.getInputByLabelText('GBP').click();

    // 391 = (100 / 2) + (200 / 0.5) - 60 + a little extra under the tolerance
    cy.keyboardInput(cy.getInputByLabelText('Amount received'), '391');

    cy.completeDateFormFields({ idPrefix: 'payment-date', day: '12', month: '12', year: '2023' });

    cy.getInputByLabelText('No').click();

    cy.clickContinueButton();

    cy.contains('Premium payments').should('exist');

    cy.assertText(premiumPaymentsTable.status(FEE_RECORD_ID_ONE), FEE_RECORD_STATUS.MATCH);
  });

  it('redirects user to premium payments tab with match success notification when taken to match whilst trying to add another payment', () => {
    cy.getInputByLabelText('GBP').click();

    // 391 = (100 / 2) + (200 / 0.5) - 60 + a little extra under the tolerance
    cy.keyboardInput(cy.getInputByLabelText('Amount received'), '391');

    cy.completeDateFormFields({ idPrefix: 'payment-date', day: '12', month: '12', year: '2023' });

    cy.getInputByLabelText('Yes').click();

    cy.clickContinueButton();

    cy.contains('Premium payments').should('exist');

    cy.assertText(premiumPaymentsTable.status(FEE_RECORD_ID_ONE), FEE_RECORD_STATUS.MATCH);

    cy.assertText(premiumPaymentsTab.matchSuccessNotificationHeading(), 'Match payment recorded');

    cy.assertText(
      premiumPaymentsTab.matchSuccessNotificationMessage(),
      'The fee(s) are now at a Match state. Further payments cannot be added to the fee record.',
    );
  });

  it('submits form and reloads the page with no values when user submits form with valid values and user selects yes to adding another payment', () => {
    cy.getInputByLabelText('GBP').click();
    cy.keyboardInput(cy.getInputByLabelText('Amount received'), '100');
    cy.completeDateFormFields({ idPrefix: 'payment-date', day: '12', month: '12', year: '2023' });
    cy.getInputByLabelText('Yes').click();

    cy.clickContinueButton();

    cy.get('h1').invoke('text').should('contain', 'Add a payment');
    cy.getInputByLabelText('GBP').should('not.be.checked');
    cy.getInputByLabelText('USD').should('not.be.checked');
    cy.getInputByLabelText('JPY').should('not.be.checked');
    cy.getInputByLabelText('EUR').should('not.be.checked');
    cy.getInputByLabelText('Amount received').should('have.value', '');
    cy.getInputByLabelText('Day').should('have.value', '');
    cy.getInputByLabelText('Month').should('have.value', '');
    cy.getInputByLabelText('Year').should('have.value', '');
    cy.getInputByLabelText('Payment reference').should('have.value', '');
    cy.getInputByLabelText('Yes').should('not.be.checked');
    cy.getInputByLabelText('No').should('not.be.checked');
  });

  describe('when user navigates away', () => {
    const FEE_RECORD_ID_THREE = '33';
    const FEE_RECORD_ID_FOUR = '44';

    beforeEach(() => {
      const feeRecordThree = FeeRecordEntityMockBuilder.forReport(report)
        .withId(FEE_RECORD_ID_THREE)
        .withPaymentCurrency(PAYMENT_CURRENCY)
        .withStatus(FEE_RECORD_STATUS.TO_DO)
        .build();
      const feeRecordFour = FeeRecordEntityMockBuilder.forReport(report)
        .withId(FEE_RECORD_ID_FOUR)
        .withPaymentCurrency(PAYMENT_CURRENCY)
        .withStatus(FEE_RECORD_STATUS.TO_DO)
        .build();

      cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
      cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

      const feeRecords = [feeRecordOne, feeRecordTwo, feeRecordThree, feeRecordFour];
      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
    });

    describe('by clicking the back button with checkboxes for fee records 3 and 4 checked', () => {
      beforeEach(() => {
        pages.landingPage.visit();
        cy.login(USERS.PDC_RECONCILE);

        cy.visit(`utilisation-reports/${REPORT_ID}`);
        premiumPaymentsTable.checkbox([FEE_RECORD_ID_THREE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).check();
        premiumPaymentsTable.checkbox([FEE_RECORD_ID_FOUR], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).check();

        premiumPaymentsTab.addAPaymentButton().click();
        cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/add-payment`));

        cy.clickBackLink();
      });

      it('should redirect the user to the premium payments page', () => {
        cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}?selectedFeeRecordIds=${FEE_RECORD_ID_THREE}%2C${FEE_RECORD_ID_FOUR}`));
      });

      it('should persist the selected fees', () => {
        premiumPaymentsTable.checkbox([FEE_RECORD_ID_ONE, FEE_RECORD_ID_TWO], PAYMENT_CURRENCY, FEE_RECORD_STATUS.DOES_NOT_MATCH).should('not.be.checked');

        premiumPaymentsTable.checkbox([FEE_RECORD_ID_THREE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).should('be.checked');

        premiumPaymentsTable.checkbox([FEE_RECORD_ID_FOUR], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).should('be.checked');
      });
    });

    describe('by clicking the cancel button with checkboxes for fee records 3 and 4 checked', () => {
      beforeEach(() => {
        pages.landingPage.visit();
        cy.login(USERS.PDC_RECONCILE);

        cy.visit(`utilisation-reports/${REPORT_ID}`);
        premiumPaymentsTable.checkbox([FEE_RECORD_ID_THREE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).check();
        premiumPaymentsTable.checkbox([FEE_RECORD_ID_FOUR], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).check();

        premiumPaymentsTab.addAPaymentButton().click();
        cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/add-payment`));

        cy.clickCancelLink();
      });

      it('should redirect the user to the premium payments page', () => {
        cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}?selectedFeeRecordIds=${FEE_RECORD_ID_THREE}%2C${FEE_RECORD_ID_FOUR}`));
      });

      it('should persist the selected fees', () => {
        premiumPaymentsTable.checkbox([FEE_RECORD_ID_ONE, FEE_RECORD_ID_TWO], PAYMENT_CURRENCY, FEE_RECORD_STATUS.DOES_NOT_MATCH).should('not.be.checked');

        premiumPaymentsTable.checkbox([FEE_RECORD_ID_THREE], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).should('be.checked');

        premiumPaymentsTable.checkbox([FEE_RECORD_ID_FOUR], PAYMENT_CURRENCY, FEE_RECORD_STATUS.TO_DO).should('be.checked');
      });
    });
  });
});

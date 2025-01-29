import pages from '../../../../e2e/pages';

const { premiumPaymentsContent } = pages.utilisationReportPage.tabs;
const { premiumPaymentsTable } = premiumPaymentsContent;

/**
 * adds a payment to the provided fee records through the ui
 * @param {FeeRecordEntity[]} feeRecords - the fee records to add the payment to
 * @param {string} reportId - report id
 * @param {Currency} paymentCurrency - the currency to select for the payment
 * @param {number | string} amountReceived - the user input for the payment amount
 */
const addPaymentToFeeRecords = ({ feeRecords, reportId, paymentCurrency, amountReceived }) => {
  cy.visit(`utilisation-reports/${reportId}`);

  feeRecords.forEach((feeRecord) => {
    premiumPaymentsTable.checkbox([feeRecord.id], feeRecord.paymentCurrency, feeRecord.status).click();
  });

  premiumPaymentsContent.addAPaymentButton().click();

  cy.getInputByLabelText(paymentCurrency).click();

  cy.keyboardInput(cy.getInputByLabelText('Amount received'), amountReceived);

  cy.completeDateFormFields({ idPrefix: 'payment-date', day: '1', month: '2', year: '2024' });

  cy.getInputByLabelText('No').click();

  cy.clickContinueButton();
};

export default addPaymentToFeeRecords;

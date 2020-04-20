const page = {
  bondValueInput: () => cy.get('[data-cy="bond-value"]'),
  transactionCurrencySameAsSupplyContractCurrencyYesInput: () => cy.get('[data-cy="transaction-currency-same-as-supply-contract-currency-yes"]'),
  transactionCurrencySameAsSupplyContractCurrencyNoInput: () => cy.get('[data-cy="transaction-currency-same-as-supply-contract-currency-no"]'),
  currencyInput: () => cy.get('[data-cy="currency"]'),
  conversionRateInput: () => cy.get('[data-cy="conversion-rate"]'),
  conversionRateDateDayInput: () => cy.get('[data-cy="conversionRateDate-day"]'),
  conversionRateDateMonthInput: () => cy.get('[data-cy="conversionRateDate-month"]'),
  conversionRateDateYearInput: () => cy.get('[data-cy="conversionRateDate-year"]'),
  riskMarginFeeInput: () => cy.get('[data-cy="risk-margin-fee"]'),
  coveredPercentageInput: () => cy.get('[data-cy="covered-percentage"]'),
  minimumRiskMarginFeeInput: () => cy.get('[data-cy="minimum-risk-margin-fee"]'),
  guaranteeFeePayableByBankInput: () => cy.get('[data-cy="guarantee-fee-payable-by-bank"]'),
  ukefExposureInput: () => cy.get('[data-cy="ukef-exposure"]'),
  submit: () => cy.get('button'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;

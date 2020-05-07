const page = {
  bondValueInput: () => cy.get('[data-cy="bond-value"]'),
  bondValueInputErrorMessage: () => cy.get('[data-cy="bond-value-error-message"]'),

  transactionCurrencySameAsSupplyContractCurrencyYesInput: () => cy.get('[data-cy="transaction-currency-same-as-supply-contract-currency-yes"]'),
  transactionCurrencySameAsSupplyContractCurrencyNoInput: () => cy.get('[data-cy="transaction-currency-same-as-supply-contract-currency-no"]'),
  transactionCurrencySameAsSupplyContractCurrencyInputErrorMessage: () => cy.get('[data-cy="transactionCurrencySameAsSupplyContractCurrency-error-message"]'),

  // 'transaction currency NOT the same as supply contract currency' specifics
  currencyInput: () => cy.get('[data-cy="currency"]'),
  currencyInputErrorMessage: () => cy.get('[data-cy="currency-error-message"]'),

  conversionRateInput: () => cy.get('[data-cy="conversion-rate"]'),
  conversionRateInputErrorMessage: () => cy.get('[data-cy="conversion-rate-error-message"]'),

  conversionRateDateDayInput: () => cy.get('[data-cy="conversionRateDate-day"]'),
  conversionRateDateMonthInput: () => cy.get('[data-cy="conversionRateDate-month"]'),
  conversionRateDateYearInput: () => cy.get('[data-cy="conversionRateDate-year"]'),
  conversionRateDateInputErrorMessage: () => cy.get('[data-cy="conversionRateDate-error-message"]'),

  // always present in page
  riskMarginFeeInput: () => cy.get('[data-cy="risk-margin-fee"]'),
  riskMarginFeeInputErrorMessage: () => cy.get('[data-cy="risk-margin-fee-error-message"]'),

  coveredPercentageInput: () => cy.get('[data-cy="covered-percentage"]'),
  coveredPercentageInputErrorMessage: () => cy.get('[data-cy="covered-percentage-error-message"]'),

  minimumRiskMarginFeeInput: () => cy.get('[data-cy="minimum-risk-margin-fee"]'),
  minimumRiskMarginFeeInputErrorMessage: () => cy.get('[data-cy="minimum-risk-margin-fee"]'),

  guaranteeFeePayableByBankInput: () => cy.get('[data-cy="guarantee-fee-payable-by-bank"]'),
  ukefExposureInput: () => cy.get('[data-cy="ukef-exposure"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;








const page = {
  title: () => cy.get('[data-cy="loan"]'),

  facilityValueInput: () => cy.get('[data-cy="facility-value"]'),
  facilityValueInputErrorMessage: () => cy.get('[data-cy="facility-value-error-message"]'),

  currencySameAsSupplyContractCurrencyInputYes: () => cy.get('[data-cy="currency-same-as-supply-contract-currency-yes"]'),
  currencySameAsSupplyContractCurrencyInputNo: () => cy.get('[data-cy="currency-same-as-supply-contract-currency-no"]'),
  currencySameAsSupplyContractCurrencyInputErrorMessage: () => cy.get('[data-cy="currencySameAsSupplyContractCurrency-error-message"]'),

  // 'transaction currency NOT the same as supply contract currency' specifics
  currencyInput: () => cy.get('[data-cy="currency"]'),
  currencyInputErrorMessage: () => cy.get('[data-cy="currency-error-message"]'),

  conversionRateInput: () => cy.get('[data-cy="conversion-rate"]'),
  conversionRateInputErrorMessage: () => cy.get('[data-cy="conversion-rate-error-message"]'),

  conversionRateDateDayInput: () => cy.get('[data-cy="conversionRateDate-day"]'),
  conversionRateDateMonthInput: () => cy.get('[data-cy="conversionRateDate-month"]'),
  conversionRateDateYearInput: () => cy.get('[data-cy="conversionRateDate-year"]'),
  conversionRateDateInputErrorMessage: () => cy.get('[data-cy="conversionRateDate-error-message"]'),

  // facilityStage 'Unconditional' specifics
  disbursementAmountInput: () => cy.get('[data-cy="disbursement-amount"]'),
  disbursementAmountInputErrorMessage: () => cy.get('[data-cy="disbursement-amount-error-message"]'),

  // always present in page
  interestMarginFeeInput: () => cy.get('[data-cy="interest-margin-fee"]'),
  interestMarginFeeInputErrorMessage: () => cy.get('[data-cy="interest-margin-fee-error-message"]'),

  coveredPercentageInput: () => cy.get('[data-cy="covered-percentage"]'),
  coveredPercentageInputErrorMessage: () => cy.get('[data-cy="covered-percentage-error-message"]'),

  minimumQuarterlyFeeInput: () => cy.get('[data-cy="minimum-quarterly-fee"]'),
  minimumQuarterlyFeeInputErrorMessage: () => cy.get('[data-cy="minimum-quarterly-fee-error-message"]'),

  guaranteeFeePayableByBankInput: () => cy.get('[data-cy="guarantee-fee-payable-by-bank"]'),
  ukefExposureInput: () => cy.get('[data-cy="ukef-exposure"]'),

  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;

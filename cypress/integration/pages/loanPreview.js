const page = {
  facilityStage: () => cy.get('[data-cy="facility-stage"]'),
  bankReferenceNumber: () => cy.get('[data-cy="bank-reference-number"]'),
  requestedCoverStartDate: () => cy.get('[data-cy="requested-cover-start-date"]'),
  coverEndDate: () => cy.get('[data-cy="cover-end-date"]'),

  facilityValue: () => cy.get('[data-cy="facility-value"]'),
  currencySameAsSupplyContractCurrency: () => cy.get('[data-cy="currency-same-as-supply-contract-currency"]'),
  currency: () => cy.get('[data-cy="currency"]'),
  conversionRate: () => cy.get('[data-cy="conversion-rate"]'),
  conversionRateDate: () => cy.get('[data-cy="conversion-rate-date"]'),
  disbursementAmount: () => cy.get('[data-cy="disbursement-amount"]'),
  interestMarginFee: () => cy.get('[data-cy="interest-margin-fee"]'),
  coveredPercentage: () => cy.get('[data-cy="covered-percentage"]'),
  minimumQuarterlyFee: () => cy.get('[data-cy="minimum-quarterly-fee"]'),
  guaranteeFeePayableByBank: () => cy.get('[data-cy="guarantee-fee-payable-by-bank"]'),
  ukefExposure: () => cy.get('[data-cy="ukef-exposure"]'),

  premiumType: () => cy.get('[data-cy="premium-type"]'),
  premiumFrequency: () => cy.get('[data-cy="premium-frequency"]'),
  dayCountBasis: () => cy.get('[data-cy="day-count-basis"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;

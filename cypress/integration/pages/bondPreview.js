const page = {
  goBackButton: () => cy.get('[data-cy="go-back-button"]'),

  // bond details
  bondIssuer: () => cy.get('[data-cy="bond-issuer"]'),
  bondType: () => cy.get('[data-cy="bond-type"]'),
  bondStage: () => cy.get('[data-cy="bond-stage"]'),
  bondBeneficiary: () => cy.get('[data-cy="bond-beneficiary"]'),

  // bond details - 'unissued' bond stage specifics
  ukefGuaranteeInMonths: () => cy.get('[data-cy="ukef-guarantee-in-months"]'),

  // bond details - 'issued' bond stage specifics
  requestedCoverStartDate: () => cy.get('[data-cy="requested-cover-start-date"]'),
  coverEndDate: () => cy.get('[data-cy="cover-end-date"]'),
  uniqueIdentificationNumber: () => cy.get('[data-cy="unique-identification-number"]'),

  // bond financial details
  bondValue: () => cy.get('[data-cy="bond-value"]'),
  transactionCurrencySameAsSupplyContractCurrency: () => cy.get('[data-cy="transaction-currency-same-as-supply-contract-currency"]'),
  riskMarginFee: () => cy.get('[data-cy="risk-margin-fee"]'),
  coveredPercentage: () => cy.get('[data-cy="covered-percentage"]'),
  minimumRiskMarginFee: () => cy.get('[data-cy="minimum-risk-margin-fee"]'),
  guaranteeFeePayableByBank: () => cy.get('[data-cy="guarantee-fee-payable-by-bank"]'),
  ukefExposure: () => cy.get('[data-cy="ukef-exposure"]'),

  // bond financial details - 'currency NOT the same' specifics
  currency: () => cy.get('[data-cy="currency"]'),
  conversionRate: () => cy.get('[data-cy="conversion-rate"]'),
  conversionRateDate: () => cy.get('[data-cy="conversion-rate-date"]'),

  // bond fee details
  feeType: () => cy.get('[data-cy="fee-type"]'),
  feeFrequency: () => cy.get('[data-cy="fee-frequency"]'),
  dayCountBasis: () => cy.get('[data-cy="day-count-basis"]'),
};

module.exports = page;

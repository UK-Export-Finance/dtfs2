const facilityValue = {
  hiddenFacilityType: () => cy.get('[data-cy="hidden-facility-type"]'),
  value: () => cy.get('[data-cy="value"]'),
  valueLabel: () => cy.get('[data-cy="value-label"]'),
  valueError: () => cy.get('[data-cy="value-error"]'),
  valueSuffix: () => cy.get('[data-cy="value-suffix"]'),
  percentageCover: () => cy.get('[data-cy="percentage-cover"]'),
  percentageCoverError: () => cy.get('[data-cy="percentage-cover-error"]'),
  interestPercentage: () => cy.get('[data-cy="interest-percentage"]'),
  interestPercentageHint: () => cy.get('[data-cy="interest-percentage-hint"]'),
  interestPercentageError: () => cy.get('[data-cy="interest-percentage-error"]'),
};

export default facilityValue;

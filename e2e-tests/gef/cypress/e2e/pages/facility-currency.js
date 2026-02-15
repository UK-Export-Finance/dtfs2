const facilityCurrency = {
  hiddenFacilityType: () => cy.get('[data-cy="hidden-facility-type"]'),
  currencyError: () => cy.get('[data-cy="currency-error"]'),
  yenCheckbox: () => cy.get('[data-cy="yen-checkbox"]'),
  returnToApplicationButton: () => cy.get('[data-cy="return-to-application-button"]'),
};

export default facilityCurrency;

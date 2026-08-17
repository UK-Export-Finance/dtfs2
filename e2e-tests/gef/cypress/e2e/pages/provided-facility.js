const providedFacility = {
  hiddenFacilityType: () => cy.get('[data-cy="hidden-facility-type"]'),
  detailsOther: () => cy.get('[data-cy="details-other"]'),
  detailsOtherError: () => cy.get('[data-cy="details-other-error"]'),
  otherCheckbox: () => cy.get('[data-cy="other-checkbox"]'),
};

export default providedFacility;

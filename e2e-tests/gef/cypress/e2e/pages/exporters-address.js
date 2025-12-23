const automaticCover = {
  companyNameTitle: () => cy.get('[data-cy="company-name-title"]'),
  registeredCompanyAddressTitle: () => cy.get('[data-cy="registered-company-address-title"]'),
  changeDetails: () => cy.get('[data-cy="change-details"]'),
  postcodeError: () => cy.get('[data-cy="postcode-error"]'),
  fieldError: () => cy.get('[data-cy="correspondence-error"]'),
  yesRadioButton: () => cy.get('[data-cy="correspondence-yes"]'),
  noRadioButton: () => cy.get('[data-cy="correspondence-no"]'),
  correspondenceAddress: () => cy.get('[data-cy="correspondence-address"]'),
  manualAddressEntryLink: () => cy.get('[data-cy="enter-address-manually"]'),
};

export default automaticCover;

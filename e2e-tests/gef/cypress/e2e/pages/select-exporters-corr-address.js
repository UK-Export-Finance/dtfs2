const selectExportersCorAddress = {
  postcodeTitle: () => cy.get('[data-cy="postcode-title"]'),
  postcode: () => cy.get('[data-cy="postcode"]'),
  selectAddress: () => cy.get('[data-cy="select-address"]'),
  selectAddressError: () => cy.get('[data-cy="select-address-error"]'),
  cantFindAddress: () => cy.get('[data-cy="cant-find-address"]'),
  changeLink: () => cy.get('[data-cy="change-link"]'),
};

export default selectExportersCorAddress;

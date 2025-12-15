const enterExportersCorAddress = {
  addressLine1: () => cy.get('[data-cy="address-line-1"]'),
  addressLine2: () => cy.get('[data-cy="address-line-2"]'),
  addressLine3: () => cy.get('[data-cy="address-line-3"]'),
  addressLine1Error: () => cy.get('[data-cy="address-line-1-error"]'),
  postcodeError: () => cy.get('[data-cy="postcode-error"]'),
  locality: () => cy.get('[data-cy="locality"]'),
  postcode: () => cy.get('[data-cy="postcode"]'),
};

export default enterExportersCorAddress;

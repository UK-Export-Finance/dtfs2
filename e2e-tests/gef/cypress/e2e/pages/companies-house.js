/* eslint-disable no-undef */
const companiesHouse = {
  regNumberField: () => cy.get('[data-cy="reg-number-field"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
  summaryDetails: () => cy.get('[data-cy="summary-details"]'),
  regNumberFieldError: () => cy.get('[data-cy="reg-number-field-error"]'),
};

export default companiesHouse;

const companiesHouse = {
  regNumberField: () => cy.get('[data-cy="reg-number-field"]'),
  summaryDetails: () => cy.get('[data-cy="summary-details"]'),
  regNumberFieldError: () => cy.get('[data-cy="reg-number-field-error"]'),
};

export default companiesHouse;

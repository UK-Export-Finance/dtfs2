const mandatoryCriteria = {
  mandatoryCriteriaText: () => cy.get('[data-cy="mandatory-criteria"]'),
  firstErrorLink: () => cy.get('[data-cy="error-summary"]').first('a'),
  formError: () => cy.get('[data-cy="mandatory-criteria-error"]'),
  falseRadio: () => cy.get('[data-cy="mandatory-criteria-no"]'),
  trueRadio: () => cy.get('[data-cy="mandatory-criteria-yes"]'),
  problemWithService: () => cy.get('[data-cy="problem-with-service"]'),
};

export default mandatoryCriteria;

const automaticCover = {
  // Core elements
  trueRadioButton: (id) => cy.get(`[data-cy="automatic-cover-true-${id}"]`),
  falseRadioButton: (id) => cy.get(`[data-cy="automatic-cover-false-${id}"]`),
  automaticCoverTerm: (id) => cy.get(`[data-cy="automatic-cover-term-${id}"]`),

  // Errors
  fieldError: () => cy.get('[data-cy="automatic-cover-error"]'),
};

export default automaticCover;

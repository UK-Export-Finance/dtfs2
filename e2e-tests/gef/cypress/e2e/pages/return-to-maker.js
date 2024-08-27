/* eslint-disable no-undef */
const returnToMaker = {
  comment: () => cy.get('[data-cy="checker-comments"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

export default returnToMaker;

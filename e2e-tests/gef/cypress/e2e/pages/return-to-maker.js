/* eslint-disable no-undef */
const returnToMaker = {
  comment: () => cy.get('[data-cy="checker-comments"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

export default returnToMaker;

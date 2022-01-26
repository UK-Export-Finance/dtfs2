const ukefComments = {
  ukefDecision: {
    title: () => cy.get('[data-cy="ukef-decision-title"]'),
    text: () => cy.get('[data-cy="ukef-decision-text"]'),
  },
  comments: {
    title: () => cy.get('[data-cy="ukef-comments-title"]'),
    text: () => cy.get('[data-cy="ukef-comments-text"]'),
  },
};

module.exports = ukefComments;

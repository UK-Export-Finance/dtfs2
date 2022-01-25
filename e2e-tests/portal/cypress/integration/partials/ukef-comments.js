const ukefComments = {
  comments: {
    title: () => cy.get('[data-cy="ukef-comments-title"]'),
    text: () => cy.get('[data-cy="ukef-comments-text"]'),
  },
};

module.exports = ukefComments;

const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/comments`),
  row: (counter) => ({
    comment: () => cy.get(`[data-cy="comment-${counter}"]`),
    commentorName: () => cy.get(`[data-cy="commentor-name-${counter}"]`),
    commentDateTime: () => cy.get(`[data-cy="comment-datetime-${counter}"]`),
  }),
};

module.exports = page;

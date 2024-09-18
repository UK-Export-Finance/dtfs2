const activityCommentBoxPage = {
  activityCommentBox: () => cy.get('[data-cy="activity-comment-box"]'),
  addCommentButton: () => cy.get('[data-cy="add-comment-button"]'),

  commentErrorMessage: () => cy.get('[data-cy="activity-comment-error"]'),
};

module.exports = activityCommentBoxPage;

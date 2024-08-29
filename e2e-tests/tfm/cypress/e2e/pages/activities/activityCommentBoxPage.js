const activityCommentBoxPage = {
  activityCommentBox: () => cy.get('[data-cy="activity-comment-box"]'),
  addCommentButton: () => cy.get('[data-cy="add-comment-button"]'),
  cancelButton: () => cy.get('[data-cy="cancel-comment-link"]'),

  commentErrorMessage: () => cy.get('[data-cy="activity-comment-error"]'),
};

module.exports = activityCommentBoxPage;

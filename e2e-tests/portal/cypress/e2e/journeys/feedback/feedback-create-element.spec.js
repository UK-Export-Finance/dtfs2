const { feedbackPage } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { ADMIN } = MOCK_USERS;

context('Feedback - create element and check if inserted into feedback', () => {
  beforeEach(() => {
    cy.saveSession();
    feedbackPage.visit();
  });

  it("should not insert created element's data in the feedback", () => {
    feedbackPage.role().type('test');
    feedbackPage.organisation().type('test');
    feedbackPage.reasonForVisitingSelection().click();
    feedbackPage.easyToUseSelection().click();
    feedbackPage.clearlyExplainedSelection().click();
    feedbackPage.satisfiedSelection().click();
    feedbackPage.howCanWeImprove().type('test');
    feedbackPage.emailAddress().clear();

    cy.insertElement('feedback-form');

    feedbackPage.submitButton().click();

    cy.getAllFeedback(ADMIN).then((feedback) => {
      const feedbackLength = feedback.length;

      const latestFeedback = feedback[feedbackLength - 1];

      // ensure the latest feedback does not contain additional intruder field
      expect(latestFeedback.intruder).to.be.an('undefined');
    });
  });
});

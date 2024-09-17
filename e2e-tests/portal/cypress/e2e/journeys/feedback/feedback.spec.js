import relative from '../../relativeURL';

const { errorSummary } = require('../../partials');
const { feedbackPage, header } = require('../../pages');

context('User submit feedback on portal', () => {
  beforeEach(() => {
    cy.saveSession();
    feedbackPage.visit();
  });

  it('feedback should contain correct components and text', () => {
    header.betaBannerHref().should('have.attr', 'target', '_blank');

    feedbackPage.feedBackPageHeading().contains('Feedback');

    feedbackPage.roleHeading().contains('What is your role?');
    feedbackPage.role().should('exist');

    feedbackPage.organisationHeading().contains('Which organisation do you work for?');
    feedbackPage.organisation().should('exist');

    feedbackPage.reasonForVisiting().should('exist');

    feedbackPage.ratingHeading().contains('How would you rate this service?');

    feedbackPage.easyToUse().should('exist');

    feedbackPage.clearlyExplained().should('exist');

    feedbackPage.satisfied().should('exist');

    feedbackPage.howCanWeImproveHeading().contains('How can we improve this service? (optional)');
    feedbackPage.howCanWeImprove().should('exist');

    feedbackPage.emailAddressHeading().contains('Help us make this service better (optional)');
    feedbackPage.emailAddressHint().contains('Leave your email address if you want to help with our user research.');
    feedbackPage.emailAddress().should('exist');
  });

  it('feedback should give errors if incorrectly entered', () => {
    feedbackPage.emailAddress().type('a');

    cy.clickSubmitButton();

    feedbackPage.roleErrorMessage().contains('Enter your role');
    feedbackPage.organisationErrorMessage().contains('Enter which organisation you work for');
    feedbackPage.reasonForVisitingErrorMessage().contains('Select your reason for visiting the service today');
    feedbackPage.easyToUseErrorMessage().contains('Select a rating for how easy the service is to use');
    feedbackPage.clearlyExplainedErrorMessage().contains('Select a rating for how clearly explained the information you need to provide is');
    feedbackPage.satisfiedErrorMessage().contains('Select a rating for how satisfied you are with the service');
    feedbackPage.emailAddressErrorMessage().contains('Enter an email address in the correct format, like name@example.com');

    errorSummary().contains('Enter your role');
    errorSummary().contains('Enter which organisation you work for');
    errorSummary().contains('Select your reason for visiting the service today');
    errorSummary().contains('Select a rating for how easy the service is to use');
    errorSummary().contains('Select a rating for how clearly explained the information you need to provide is');
    errorSummary().contains('Select a rating for how satisfied you are with the service');
    errorSummary().contains('Enter an email address in the correct format, like name@example.com');
  });

  it('feedback should submit without errors and with correct thank you page', () => {
    feedbackPage.role().type('test');
    feedbackPage.organisation().type('test');
    feedbackPage.reasonForVisitingSelection().click();
    feedbackPage.easyToUseSelection().click();
    feedbackPage.clearlyExplainedSelection().click();
    feedbackPage.satisfiedSelection().click();
    feedbackPage.howCanWeImprove().type('test');
    feedbackPage.emailAddress().clear();

    cy.clickSubmitButton();

    cy.url().should('eq', relative('/thank-you-feedback'));

    feedbackPage.thankYouPageHeading().contains('Feedback');
    feedbackPage
      .thankYouPageText()
      .contains(
        'Thank you for your feedback. We will use your feedback for future improvement. Do let us know if there is anything else we need to know to improve this area of concern.',
      );
  });
});

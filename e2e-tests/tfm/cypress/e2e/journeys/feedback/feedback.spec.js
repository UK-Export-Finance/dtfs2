import relative from '../../relativeURL';
import { errorSummary, header } from '../../partials';
import feedbackPage from '../../pages/feedbackPage';

context('User submit feedback on TFM', () => {
  beforeEach(() => {
    cy.saveSession();
    feedbackPage.visit();
  });

  it('feedback should contain correct components and text', () => {
    header.betaBannerHref().should('have.attr', 'target', '_blank');

    feedbackPage.feedBackPageHeading().contains('Feedback');

    feedbackPage.roleHeading().contains('What is your role?');
    feedbackPage.role().should('exist');

    feedbackPage.teamHeading().contains('Which team do you work in?');
    feedbackPage.team().should('exist');

    feedbackPage.whyUsingServiceHeading().contains('Why were you using the service today?');
    feedbackPage.whyUsingService().should('exist');

    feedbackPage.ratingHeading().contains('How would you rate this service?');

    feedbackPage.easyToUse().should('exist');

    feedbackPage.satisfied().should('exist');

    feedbackPage.howCanWeImproveHeading().contains('How can we improve the service? (optional)');
    feedbackPage.howCanWeImprove().should('exist');

    feedbackPage.emailAddressHeading().contains('Email address (optional)');
    feedbackPage.emailAddressHint().contains('We will use it to contact you to participate in research and testing to help us improve the service.');
    feedbackPage.emailAddress().should('exist');
  });

  it('feedback should contain correct components and text', () => {
    header.betaBannerHref().should('have.attr', 'target', '_blank');

    cy.keyboardInput(feedbackPage.emailAddress(), 'a');

    cy.clickSubmitButton();

    feedbackPage.teamHeading().contains('Which team do you work in?');
    feedbackPage.team().should('exist');

    errorSummary().contains('Enter your role');
    errorSummary().contains('Enter which team you work for');
    errorSummary().contains('Enter your reason for using this service today');
    errorSummary().contains('Select a rating for how easy the service is to use');
    errorSummary().contains('Select a rating for how satisfied you are with the service');
    errorSummary().contains('Enter an email address in the correct format, like name@example.com');
  });

  it('feedback should submit without errors and with correct thank you page', () => {
    feedbackPage.role().type('test');
    feedbackPage.team().type('test');
    feedbackPage.whyUsingService().type('test');
    feedbackPage.easyToUseSelection().click();
    feedbackPage.satisfiedSelection().click();
    feedbackPage.howCanWeImprove().type('test');
    feedbackPage.emailAddress().clear();

    cy.keyboardInput(feedbackPage.role(), 'test');
    cy.keyboardInput(feedbackPage.team(), 'test');
    cy.keyboardInput(feedbackPage.whyUsingService(), 'test');
    feedbackPage.easyToUseSelection().click();
    feedbackPage.satisfiedSelection().click();
    cy.keyboardInput(feedbackPage.howCanWeImprove(), 'test');
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

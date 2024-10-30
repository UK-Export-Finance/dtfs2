import relative from '../../relativeURL';
import { errorSummary, header } from '../../partials';
import pages from '../../pages';

context('User submit feedback on TFM', () => {
  it('feedback should contain correct components and text', () => {
    pages.landingPage.visit();
    header.betaBannerHref().should('have.attr', 'target', '_blank');

    pages.feedbackPage.visit();

    pages.feedbackPage.feedBackPageHeading().contains('Feedback');

    pages.feedbackPage.roleHeading().contains('What is your role?');
    pages.feedbackPage.role().should('exist');

    pages.feedbackPage.teamHeading().contains('Which team do you work in?');
    pages.feedbackPage.team().should('exist');

    pages.feedbackPage.whyUsingServiceHeading().contains('Why were you using the service today?');
    pages.feedbackPage.whyUsingService().should('exist');

    pages.feedbackPage.ratingHeading().contains('How would you rate this service?');

    pages.feedbackPage.easyToUse().should('exist');

    pages.feedbackPage.satisfied().should('exist');

    pages.feedbackPage.howCanWeImproveHeading().contains('How can we improve the service? (optional)');
    pages.feedbackPage.howCanWeImprove().should('exist');

    pages.feedbackPage.emailAddressHeading().contains('Email address (optional)');
    pages.feedbackPage.emailAddressHint().contains('We will use it to contact you to participate in research and testing to help us improve the service.');
    pages.feedbackPage.emailAddress().should('exist');
  });

  it('feedback should give errors if incorrectly filled up', () => {
    pages.feedbackPage.visit();

    cy.keyboardInput(pages.feedbackPage.emailAddress(), 'a');

    cy.clickSubmitButton();

    pages.feedbackPage.roleErrorMessage().contains('Enter your role');
    pages.feedbackPage.teamErrorMessage().contains('Enter which team you work for');
    pages.feedbackPage.whyUsingServiceErrorMessage().contains('Enter your reason for using this service today');
    pages.feedbackPage.easyToUseErrorMessage().contains('Select a rating for how easy the service is to use');
    pages.feedbackPage.satisfiedErrorMessage().contains('Select a rating for how satisfied you are with the service');
    pages.feedbackPage.emailAddressErrorMessage().contains('Enter an email address in the correct format, like name@example.com');

    errorSummary().contains('Enter your role');
    errorSummary().contains('Enter which team you work for');
    errorSummary().contains('Enter your reason for using this service today');
    errorSummary().contains('Select a rating for how easy the service is to use');
    errorSummary().contains('Select a rating for how satisfied you are with the service');
    errorSummary().contains('Enter an email address in the correct format, like name@example.com');
  });

  it('feedback should submit without errors and with correct thank you page', () => {
    pages.feedbackPage.visit();

    cy.keyboardInput(pages.feedbackPage.role(), 'test');
    cy.keyboardInput(pages.feedbackPage.team(), 'test');
    cy.keyboardInput(pages.feedbackPage.whyUsingService(), 'test');
    pages.feedbackPage.easyToUseSelection().click();
    pages.feedbackPage.satisfiedSelection().click();
    cy.keyboardInput(pages.feedbackPage.howCanWeImprove(), 'test');
    pages.feedbackPage.emailAddress().clear();

    cy.clickSubmitButton();

    cy.url().should('eq', relative('/thank-you-feedback'));

    pages.feedbackPage.thankYouPageHeading().contains('Feedback');
    pages.feedbackPage
      .thankYouPageText()
      .contains(
        'Thank you for your feedback. We will use your feedback for future improvement. Do let us know if there is anything else we need to know to improve this area of concern.',
      );
  });
});

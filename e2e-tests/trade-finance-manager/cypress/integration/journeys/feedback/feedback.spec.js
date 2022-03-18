import relative from '../../relativeURL';
import pages from '../../pages';
import partials from '../../partials';

context('User submit feedback on TFM', () => {
  it('feedback should contain correct components and text', () => {
    pages.landingPage.visit();
    partials.header.betaBannerHref().should('have.attr', 'target', '_blank');

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
    pages.feedbackPage.emailAddress().type('a');

    pages.feedbackPage.submitButton().click();

    pages.feedbackPage.roleErrorMessage().contains('Enter your role');
    pages.feedbackPage.teamErrorMessage().contains('Enter which team you work for');
    pages.feedbackPage.whyUsingServiceErrorMessage().contains('Enter your reason for using this service today');
    pages.feedbackPage.easyToUseErrorMessage().contains('Select a rating for how easy the service is to use');
    pages.feedbackPage.satisfiedErrorMessage().contains('Select a rating for how satisfied you are with the service');
    pages.feedbackPage.emailAddressErrorMessage().contains('Enter an email address in the correct format, like name@example.com');

    pages.feedbackPage.errorSummary().contains('Enter your role');
    pages.feedbackPage.errorSummary().contains('Enter which team you work for');
    pages.feedbackPage.errorSummary().contains('Enter your reason for using this service today');
    pages.feedbackPage.errorSummary().contains('Select a rating for how easy the service is to use');
    pages.feedbackPage.errorSummary().contains('Select a rating for how satisfied you are with the service');
    pages.feedbackPage.errorSummary().contains('Enter an email address in the correct format, like name@example.com');
  });

  it('feedback should submit without errors and with correct thank you page', () => {
    pages.feedbackPage.role().type('test');
    pages.feedbackPage.team().type('test');
    pages.feedbackPage.whyUsingService().type('test');
    pages.feedbackPage.easyToUseSelection().click();
    pages.feedbackPage.satisfiedSelection().click();
    pages.feedbackPage.howCanWeImprove().type('test');
    pages.feedbackPage.emailAddress().clear();

    pages.feedbackPage.submitButton().click();

    cy.url().should('eq', relative('/thank-you-feedback'));

    pages.feedbackPage.thankYouPageHeading().contains('Feedback');
    pages.feedbackPage.thankYouPageText().contains('Thank you for your feedback. We will use your feedback for future improvement. Do let us know if there is anything else we need to know to improve this area of concern.');
  });
});

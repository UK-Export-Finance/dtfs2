const { errorSummary } = require('../../../../../../partials');
const { accessCodeExpired } = require('../../../../../../pages');

const sharedAccessCodeValidationTests = ({ page, user }) => {
  it('should show validation when submitting empty access code', () => {
    cy.enterUsernameAndPassword(user);
    page.accessCodeInput().clear();
    cy.clickSubmitButton();

    errorSummary().should('contain', 'Enter access code');
    cy.assertText(page.inlineError(), 'Error: Enter access code');
  });

  it('should show validation when submitting wrong access code', () => {
    cy.enterUsernameAndPassword(user);
    page.accessCodeInput().clear();
    page.accessCodeInput().type('000000');
    cy.clickSubmitButton();

    errorSummary().should('exist');
    page.inlineError().should('exist');
    cy.assertText(page.inlineError(), 'Error: The access code you have entered is incorrect');
  });

  it('should show access code expired page when code expired', () => {
    cy.enterUsernameAndPassword(user);
    cy.visit('/login/access-code-expired');

    cy.assertText(accessCodeExpired.heading(), 'Your access code has expired');
    cy.assertText(
      accessCodeExpired.securityInfo(),
      'For security, access codes expire after 30 minutes. You can request for a new access code to be sent to your email address.',
    );
  });
};

module.exports = { sharedAccessCodeValidationTests };

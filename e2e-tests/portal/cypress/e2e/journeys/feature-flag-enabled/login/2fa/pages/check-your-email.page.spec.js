const { checkYourEmail, checkYourEmailAccessCode, newAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach, assertAccessCodePagesCommonElements, assertEmptyCodeValidation } = require('../2faPageHelpers');
const { submitButton, errorSummary } = require('../../../../../partials');

context('2FA Page - Check your email', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    /**
     * initializing the OTP send count to 0 so in the below tests when the user logs in and an OTP is sent, the count
     * becomes 1 and attemptsLeft becomes 2, which allows us to land on the check-your-email page and test its page elements.
     */
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
  });

  it('should redirect to login when visited without partial auth', () => {
    checkYourEmail.visit();

    cy.url().should('eq', relative('/login'));
  });

  describe('Requesting a new access code', () => {
    beforeEach(() => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should navigate to new-access-code when clicking request new code', () => {
      checkYourEmailAccessCode.requestCodeLink().should('exist').click();

      cy.url().should('contain', '/login/new-access-code');
    });
    it('should show email in description on new-access-code', () => {
      checkYourEmailAccessCode.requestCodeLink().click();

      newAccessCode.description().should('contain', '@');
    });
    it('should show attempts info on new-access-code', () => {
      checkYourEmailAccessCode.requestCodeLink().click();

      newAccessCode.attemptsInfo().should('exist');
    });
    it('should have csrf token on new-access-code', () => {
      checkYourEmailAccessCode.requestCodeLink().click();

      newAccessCode.csrfToken().should('not.be.empty');
    });
  });

  describe('Form, inputs and informational paragraphs', () => {
    it('should have form method POST', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.get('form').should('have.attr', 'method', 'POST');
    });

    it('should have correct form action', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.get('form').should('have.attr', 'action', '/login/check-your-email-access-code');
    });

    it('should render description containing email', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.description().should('contain', '@');
    });

    const accessCodeFormElements = [
      ['renders heading', () => checkYourEmailAccessCode.heading()],
      ['renders access code label', () => checkYourEmailAccessCode.sixDigitAccessCodeLabel()],
      ['renders expiry information', () => checkYourEmailAccessCode.expiryInfo()],
      ['renders spam/junk advice', () => checkYourEmailAccessCode.spamOrJunk()],
      ['renders suspend information', () => checkYourEmailAccessCode.suspendInfo()],
    ];

    accessCodeFormElements.forEach(([title, getter]) => {
      it(`should ${title}`, () => {
        cy.enterUsernameAndPassword(BANK1_MAKER1);

        getter().should('exist');
      });
    });

    it('should have shared common assertions for inputs, attempts, submit and request link', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      assertAccessCodePagesCommonElements({ page: checkYourEmailAccessCode });
      submitButton().should('exist');
    });

    it('should render access code input with correct placeholder', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.accessCodeInput().should('have.attr', 'placeholder', 'e.g. 123456');
    });

    it('should show attempts remaining on first visit', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.attemptsInfo().should('contain', '2');
    });

    it('should render request-code-link pointing to /login/request-new-access-code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.requestCodeLink().should('have.attr', 'href', '/login/request-new-access-code');
    });
  });

  describe('Validation', () => {
    it('should show validation when submitting empty access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      assertEmptyCodeValidation();

      checkYourEmailAccessCode.inlineError().should('contain', 'Enter access code');
      errorSummary().should('contain', 'Enter access code');
    });

    it('should show validation when submitting wrong access code', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      checkYourEmailAccessCode.accessCodeInput().clear();
      checkYourEmailAccessCode.accessCodeInput().type('000000');
      cy.get('form').submit();

      errorSummary().should('exist');
      checkYourEmailAccessCode.inlineError().should('exist');
      checkYourEmailAccessCode.inlineError().should('contain', 'The access code you have entered is incorrect');
    });

    it('should show access code expired page when code expired', () => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      cy.visit('/login/access-code-expired');

      cy.get('[data-cy="access-code-expired-heading"]').should('exist');
      cy.get('[data-cy="access-code-expired-security-info"]').should('exist');
    });
  });
});

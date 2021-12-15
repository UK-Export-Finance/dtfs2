import relative from './relativeURL';
import automaticCover from './pages/automatic-cover';
import CREDENTIALS from '../fixtures/credentials.json';

let dealId;

context('Automatic Cover Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[0]._id;
      });
    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${dealId}/automatic-cover`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      automaticCover.mainHeading();
      automaticCover.form();
      automaticCover.automaticCoverTerm().its('length').should('be.gt', 0); // contains terms
      automaticCover.continueButton();
      automaticCover.saveAndReturnButton();
    });
  });

  describe('Clicking on Continue button', () => {
    it('shows errors if no radio button has been selected', () => {
      automaticCover.continueButton().click();
      automaticCover.errorSummary();
      automaticCover.fieldError();
      automaticCover.automaticCoverTerm().its('length').should('be.gt', 0); // greater than
    });

    it('removes error message from field if a radio button has been selected', () => {
      automaticCover.trueRadioButton().first().click();
      automaticCover.continueButton().click();
      automaticCover.automaticCoverTerm().eq(0).siblings('[data-cy="automatic-cover-error"]').should('not.exist');
      automaticCover.automaticCoverTerm().eq(1).siblings('[data-cy="automatic-cover-error"]'); // second term
    });

    it('takes user to `not eligible for automatic cover` page if at least 1 FALSE field has been selected', () => {
      automaticCover.automaticCoverTerm().each(($el, index) => {
        if (index === 0) {
          $el.find('[data-cy="automatic-cover-false"]').trigger('click');
        } else {
          $el.find('[data-cy="automatic-cover-true"]').trigger('click');
        }
      });
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/ineligible-automatic-cover`));
    });

    it('takes user to `eligible for automatic cover` page if all true fields have been selected', () => {
      automaticCover.automaticCoverTerm().each(($el) => {
        $el.find('[data-cy="automatic-cover-true"]').click();
      });
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/eligible-automatic-cover`));
    });

    it('takes user to `automatic application details` page if they click on the save and return button', () => {
      automaticCover.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });
  });
});

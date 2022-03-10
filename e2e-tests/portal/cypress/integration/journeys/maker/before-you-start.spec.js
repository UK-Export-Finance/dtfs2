const pages = require('../../pages');
const partials = require('../../partials');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../fixtures/users');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Red Line eligibility checking (`before you start` page)', () => {
  it('should render headings, intro and mandatory criteria', () => {
    cy.createBSSSubmission(BANK1_MAKER1);
    cy.url().should('eq', relative('/before-you-start'));

    pages.beforeYouStart.mandatoryCriteriaHeading().should('be.visible');
    pages.beforeYouStart.mandatoryCriteriaHeading().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Mandatory criteria');
    });

    pages.beforeYouStart.mandatoryCriteriaSubHeading().should('be.visible');
    pages.beforeYouStart.mandatoryCriteriaSubHeading().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Does this deal meet all UKEF\'s mandatory criteria?');
    });

    pages.beforeYouStart.mandatoryCriteriaIntro().should('be.visible');
    pages.beforeYouStart.mandatoryCriteriaIntro().invoke('text').then((text) => {
      expect(text.trim()).to.equal('To proceed with this submission, you need to be able to affirm that all the following mandatory criteria are or will be true for this deal on the date that cover starts.');
    });

    const LATEST_MANDATORY_CRITERIA_TOTAL_CRITERIONS = 5;
    pages.beforeYouStart.mandatoryCriterion().should('have.length', LATEST_MANDATORY_CRITERIA_TOTAL_CRITERIONS);
  });

  describe('When the `Mandatory criteria` form is submitted without confirming an answer', () => {
    it('should display validation error', () => {
      cy.createBSSSubmission(BANK1_MAKER1);

      pages.beforeYouStart.submit().click();

      cy.url().should('eq', relative('/before-you-start'));
      cy.title().should('eq', `Mandatory criteria${pages.defaults.pageTitleAppend}`);

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);
    });
  });

  it('A deal that fails red-line checks is rejected and links back to home page', () => {
    cy.createBSSSubmission(BANK1_MAKER1);

    pages.beforeYouStart.false().click();
    pages.beforeYouStart.submit().click();

    cy.url().should('eq', relative('/unable-to-proceed'));

    pages.unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('the Unable To Proceed page links back to the home page', () => {
    cy.createBSSSubmission(BANK1_MAKER1);

    pages.beforeYouStart.false().click();
    pages.beforeYouStart.submit().click();

    pages.unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('A deal that passes red-line checks can progress to enter supply contract details', () => {
    cy.createBSSSubmission(BANK1_MAKER1);

    pages.beforeYouStart.true().click();
    pages.beforeYouStart.submit().click();

    cy.url().should('eq', relative('/before-you-start/bank-deal'));
  });
});

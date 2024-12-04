const pages = require('../../../pages');
const partials = require('../../../partials');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Red Line eligibility checking (`before you start` page)', () => {
  afterEach(() => {
    cy.deleteDeals(ADMIN);
  });

  it('should render headings, intro and mandatory criteria', () => {
    cy.createBSSSubmission(BANK1_MAKER1);
    cy.url().should('eq', relative('/before-you-start'));

    pages.beforeYouStart.mandatoryCriteriaHeading().should('be.visible');

    cy.assertText(pages.beforeYouStart.mandatoryCriteriaHeading(), 'Mandatory criteria');

    pages.beforeYouStart.mandatoryCriteriaSubHeading().should('be.visible');

    cy.assertText(pages.beforeYouStart.mandatoryCriteriaSubHeading(), "Does this deal meet all UKEF's mandatory criteria?");

    pages.beforeYouStart.mandatoryCriteriaIntro().should('be.visible');

    cy.assertText(
      pages.beforeYouStart.mandatoryCriteriaIntro(),
      'To proceed with this submission, you need to be able to affirm that all the following mandatory criteria are or will be true for this deal on the date that cover starts.',
    );

    const LATEST_MANDATORY_CRITERIA_TOTAL_CRITERIONS = 5;
    pages.beforeYouStart.mandatoryCriterion().should('have.length', LATEST_MANDATORY_CRITERIA_TOTAL_CRITERIONS);
  });

  describe('When the `Mandatory criteria` form is submitted without confirming an answer', () => {
    it('should display validation error', () => {
      cy.createBSSSubmission(BANK1_MAKER1);

      cy.clickSubmitButton();

      cy.url().should('eq', relative('/before-you-start'));
      cy.title().should('eq', `Mandatory criteria${pages.defaults.pageTitleAppend}`);

      partials.errorSummaryLinks().should('have.length', 1);
    });
  });

  it('A deal that fails red-line checks is rejected and links back to home page', () => {
    cy.createBSSSubmission(BANK1_MAKER1);

    pages.beforeYouStart.false().click();
    cy.clickSubmitButton();

    cy.url().should('eq', relative('/unable-to-proceed'));

    pages.unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('the Unable To Proceed page links back to the home page', () => {
    cy.createBSSSubmission(BANK1_MAKER1);

    pages.beforeYouStart.false().click();
    cy.clickSubmitButton();

    pages.unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('A deal that passes red-line checks can progress to enter supply contract details', () => {
    cy.createBSSSubmission(BANK1_MAKER1);

    pages.beforeYouStart.true().click();
    cy.clickSubmitButton();

    cy.url().should('eq', relative('/before-you-start/bank-deal'));
  });
});

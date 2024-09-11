const { contract, eligibilityCriteria, eligibilityDocumentation } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Eligibility', () => {
  beforeEach(() => {
    cy.createADeal({
      ...BANK1_MAKER1,
      bankDealId: 'someDealId',
      bankDealName: 'someDealName',
    });
  });

  describe('when all fields provided', () => {
    it('should update task list header items to `Completed` statuses, redirect to the deal page and display `Completed` status', () => {
      //---------------------------------------------------------------
      // complete and submit first eligibility form/page - Criteria
      //---------------------------------------------------------------
      contract.eligibilityCriteriaLink().click();
      eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().click({ multiple: true });
      eligibilityCriteria.nextPageButton().click();

      cy.url().should('include', '/supporting-documentation');

      //---------------------------------------------------------------
      // check that first eligibility form/page - Criteria has `completed` status
      //---------------------------------------------------------------
      cy.assertText(partials.taskListHeader.itemStatus('eligibility-criteria'), 'Completed');

      //---------------------------------------------------------------
      // complete and submit second eligibility form/page - Documentation
      //---------------------------------------------------------------
      eligibilityDocumentation.questionnaireFileInput().attachFile('questionnaire_February_2023_monthly.pdf');
      eligibilityDocumentation.saveButton().click();

      cy.url().should('include', '/check-your-answers');

      //---------------------------------------------------------------
      // check that all eligibility form/pages have `completed` status
      //---------------------------------------------------------------
      cy.assertText(partials.taskListHeader.itemStatus('supporting-documentation'), 'Completed');

      cy.assertText(partials.taskListHeader.itemStatus('eligibility-criteria'), 'Completed');

      //---------------------------------------------------------------
      // go back to deal page, check Eligibility status is `completed`
      //---------------------------------------------------------------
      cy.clickSaveGoBackButton();

      cy.url().should('not.include', '/eligibility');

      cy.assertText(contract.eligibilityStatus(), 'Completed');

      //---------------------------------------------------------------
      // go back to first Eligibility form/page
      // navigate through the forms via task list header
      // check that all `completed` statuses are retained
      //---------------------------------------------------------------

      // go back to Eligibility pages, check completed statuses
      contract.eligibilityCriteriaLink().click();
      cy.url().should('include', '/criteria');

      cy.assertText(partials.taskListHeader.itemStatus('supporting-documentation'), 'Completed');

      cy.assertText(partials.taskListHeader.itemStatus('eligibility-criteria'), 'Completed');

      partials.taskListHeader.itemLink('supporting-documentation').click();

      cy.assertText(partials.taskListHeader.itemStatus('supporting-documentation'), 'Completed');

      cy.assertText(partials.taskListHeader.itemStatus('eligibility-criteria'), 'Completed');

      partials.taskListHeader.checkYourAnswersLink().click();

      cy.assertText(partials.taskListHeader.itemStatus('supporting-documentation'), 'Completed');

      cy.assertText(partials.taskListHeader.itemStatus('eligibility-criteria'), 'Completed');
    });
  });
});

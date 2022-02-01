const {
  contract,
  eligibilityCriteria,
  eligibilityDocumentation,
  eligibilityPreview,
} = require('../../pages');
const partials = require('../../partials');
const mockUsers = require('../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

context('Eligibility', () => {
  beforeEach(() => {
    cy.createADeal({
      ...MAKER_LOGIN,
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
      partials.taskListHeader.itemStatus('eligibility-criteria').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      //---------------------------------------------------------------
      // complete and submit second eligibility form/page - Documentation
      //---------------------------------------------------------------
      eligibilityDocumentation.questionnaireFileInput().attachFile('questionnaire.pdf');
      eligibilityDocumentation.saveButton().click();

      cy.url().should('include', '/check-your-answers');

      //---------------------------------------------------------------
      // check that all eligibility form/pages have `completed` status
      //---------------------------------------------------------------
      partials.taskListHeader.itemStatus('supporting-documentation').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      partials.taskListHeader.itemStatus('eligibility-criteria').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      //---------------------------------------------------------------
      // go back to deal page, check Eligibility status is `completed`
      //---------------------------------------------------------------
      eligibilityPreview.saveGoBackButton().click();

      cy.url().should('not.include', '/eligibility');

      contract.eligibilityStatus().invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      //---------------------------------------------------------------
      // go back to first Eligibility form/page
      // navigate through the forms via task list header
      // check that all `completed` statuses are retained
      //---------------------------------------------------------------

      // go back to Eligibility pages, check completed statuses
      contract.eligibilityCriteriaLink().click();
      cy.url().should('include', '/criteria');

      partials.taskListHeader.itemStatus('supporting-documentation').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      partials.taskListHeader.itemStatus('eligibility-criteria').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      partials.taskListHeader.itemLink('supporting-documentation').click();

      partials.taskListHeader.itemStatus('supporting-documentation').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      partials.taskListHeader.itemStatus('eligibility-criteria').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      partials.taskListHeader.checkYourAnswersLink().click();

      partials.taskListHeader.itemStatus('supporting-documentation').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      partials.taskListHeader.itemStatus('eligibility-criteria').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });
    });
  });
});

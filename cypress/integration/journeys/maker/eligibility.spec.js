const {
  contract,
  eligibilityCriteria,
  eligibilityDocumentation,
} = require('../../pages');

const mockUsers = require('../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

context('Eligibility', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.createADeal({
      ...MAKER_LOGIN,
      bankDealId: 'someDealId',
      bankDealName: 'someDealName',
    });

    contract.eligibilityCriteriaLink().click();
  });

  describe('when all fields provided', () => {
    it('should redirect to the deal page and display `Completed` status', () => {
      eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().click({ multiple: true });
      eligibilityCriteria.nextPageButton().click();
      eligibilityDocumentation.questionnaireFileInput().attachFile('questionnaire.pdf');

      eligibilityDocumentation.saveGoBackButton().click();
      cy.url().should('not.include', '/eligibility');

      contract.eligibilityStatus().invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });
    });
  });
});

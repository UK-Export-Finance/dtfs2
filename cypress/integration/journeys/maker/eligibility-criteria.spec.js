const { createADeal } = require('../../missions');
const { contract, eligibilityCriteria } = require('../../pages');
const relative = require('../../relativeURL');

context('Eligibility Criteria', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    createADeal({
      username: 'MAKER',
      password: 'MAKER',
      bankDealId: 'someDealId',
      bankDealName: 'someDealName',
    });

    contract.eligibilityCriteriaLink().click();
  });

  it('The eligibility criteria page is displayed', () => {
    cy.url().should('include', '/eligibility/criteria');
  });

  it('should display the correct number of eligibility criteria', () => {
    eligibilityCriteria.eligibilityCriteriaItems().should('have.length', 8);
  });

  it('should initially display radio buttons in unselected state', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons().should('not.be.checked');
  });
});

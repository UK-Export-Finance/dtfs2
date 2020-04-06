const { createADeal } = require('../../missions');
const { contract, eligibilityCriteria } = require('../../pages');
const { errorSummary } = require('../../partials');

const relative = require('../../relativeURL');

const criteriaCount = 8;

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
    eligibilityCriteria.eligibilityCriteriaItems().should('have.length', criteriaCount);
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().should('have.length', criteriaCount);
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.falseInput().should('have.length', criteriaCount);
  });

  it('should initially display radio buttons in unselected state', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().should('not.be.checked');
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.falseInput().should('not.be.checked');
  });

  it('should display validation errors when partially submitted', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().first().click();
    eligibilityCriteria.nextPageButton().click();

    cy.url().should('include', '/eligibility/criteria');

    errorSummary.errorSummaryLinks().should('have.length', criteriaCount - 1);
  });

  it('should redirect to supporting docs page when all criteria answered', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().click({ multiple: true });
    eligibilityCriteria.nextPageButton().click();

    cy.url().should('include', '/eligibility/supporting-documentation');
  });
});

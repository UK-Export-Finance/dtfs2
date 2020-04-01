const { createADeal } = require('../../missions');
const { deleteAllDeals } = require('../../missions/deal-api');
const relative = require('../../relativeURL');
const pages = require('../../pages');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_BANK_DEAL = {
  bankDealId: 'someDealId',
  bankDealName: 'someDealName',
};

const goToCloneDealPage = () => {
  createADeal({
    ...user,
    ...MOCK_BANK_DEAL,
  });
  cy.url().should('include', '/contract/');

  pages.contract.cloneDealLink().click();
  cy.url().should('eq', relative('/before-you-start/clone'));

  pages.beforeYouStart.true().click();
  pages.beforeYouStart.submit().click();

  cy.url().should('include', '/clone');
};

context('Clone a deal', () => {
  beforeEach(async () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    await deleteAllDeals(user);
  });

  it('When a user creates a deal and clicks `clone deal` they progress to the clone page with inputs prepopulated', () => {
    goToCloneDealPage();

    // confirm that inputs are populated with the deal's initial bank deal ID
    pages.cloneDeal.bankDealIdInput().should('have.value', MOCK_BANK_DEAL.bankDealId);
    pages.cloneDeal.bankDealNameInput().should('have.value', MOCK_BANK_DEAL.bankDealName);
  });

  it('When a user clones a deal they progress to the dashboard page and render the edited bank deal id', () => {
    goToCloneDealPage();

    pages.cloneDeal.bankDealIdInput().type('-cloned');
    pages.cloneDeal.bankDealNameInput().type('-cloned');

    pages.cloneDeal.submit().click();

    cy.url().should('include', '/dashboard');

    // confirm that the last deal has the bank deal ID submitted in the 'clone deal' form
    const lastDeal = pages.dashboard.tableBodyRow().last();
    pages.dashboard.bankDealIdLink(lastDeal).invoke('text').then((text) => {
      expect(text).to.eq(`${MOCK_BANK_DEAL.bankDealId}-cloned`);
    });
  });
});

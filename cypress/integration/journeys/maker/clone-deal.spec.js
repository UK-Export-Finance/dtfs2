const { login  } = require('../../missions');
const { createADeal, deleteAllDeals } = require('../../missions/deal-api');
const relative = require('../../relativeURL');
const pages = require('../../pages');
const { cloneDeal } = require('../../pages');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankDealId: 'someDealId',
    bankDealName: 'someDealName',
  },
};

const loginGoToDealPage = (deal) => {
  // login and go to dashboard
  login(user);
  pages.dashboard.visit();

  // get the row that corresponds to our deal
  const row = pages.dashboard.row(deal);

  // go to deal page
  row.bankDealIdLink().click();
  cy.url().should('include', '/contract/');
};

const goToCloneDealPage = () => {
  pages.contract.cloneDealLink().click();
  cy.url().should('eq', relative('/before-you-start/clone'));

  pages.beforeYouStart.true().click();
  pages.beforeYouStart.submit().click();

  cy.url().should('include', '/clone');
};


context('Clone a deal', () => {
  let deal;

  beforeEach(async () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    await deleteAllDeals(user);
    deal = await createADeal(MOCK_DEAL, user);
  });

  it('When a user creates a deal and clicks `clone deal` they progress to the clone page with inputs prepopulated', () => {
    loginGoToDealPage(deal);

    goToCloneDealPage();

    // confirm that inputs are populated with the deal's initial bank deal ID
    cloneDeal.bankDealIdInput().should('have.value', MOCK_DEAL.details.bankDealId);
    cloneDeal.bankDealNameInput().should('have.value', MOCK_DEAL.details.bankDealName);
  });

  it('When a user clones a deal they progress to the dashboard page and the edited bank deal id/name is displayed in the deal page', () => {
    loginGoToDealPage(deal);
    goToCloneDealPage();

    pages.cloneDeal.bankDealIdInput().type('-cloned');
    pages.cloneDeal.bankDealNameInput().type('-cloned');

    pages.cloneDeal.submit().click();

    cy.url().should('include', '/dashboard');

    // go to deal page
    const lastTableRowBankDealIdLink = pages.dashboard.lastTableRowBankDealIdLink(pages.dashboard.lastTableRow());
    lastTableRowBankDealIdLink.click();

    cy.url().should('include', '/contract');


    // confirm that the cloned deal has the bank deal ID and bank name submitted in the 'clone deal' form

    pages.contract.supplyContractName().invoke('text').then((text) => {
      expect(text.trim()).equal(`${MOCK_DEAL.details.bankDealName}-cloned`);
    });

    pages.contract.bankSupplyContractID().invoke('text').then((text) => {
      expect(text.trim()).equal(`${MOCK_DEAL.details.bankDealId}-cloned`);
    });
  });

  // TODO when we have bonds/transactions setup
  //
  // When a user clones a deal and chooses to not clone transactions
  // the cloned deal should not include transactions
});

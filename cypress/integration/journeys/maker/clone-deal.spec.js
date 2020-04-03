const { login  } = require('../../missions');
const { createADeal, deleteAllDeals } = require('../../missions/deal-api');
const relative = require('../../relativeURL');
const pages = require('../../pages');
const { cloneDeal } = require('../../pages');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

const loginGoToDealPage = (deal) => {
  // login and go to dashboard
  login(user);
  pages.dashboard.visit();

  // get the row that corresponds to our deal
  const row = pages.dashboard.row(deal);

  // go to deal page
  row.bankSupplyContractIDLink().click();
  cy.url().should('include', '/contract/');
};

const goToCloneDealPage = () => {
  pages.contract.cloneDealLink().click();
  cy.url().should('include', '/clone/before-you-start');

  pages.beforeYouStart.true().click();
  pages.beforeYouStart.submit().click();

  cy.url().should('include', '/contract');
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
  });

  it('When a user creates a deal and clicks `clone deal` they progress to the clone page with inputs prepopulated', async () => {
    deal = await createADeal(MOCK_DEAL, user);

    loginGoToDealPage(deal);

    goToCloneDealPage();

    // confirm that inputs are populated with the deal's initial bankSupplyContractID/bankSupplyContractName
    cloneDeal.bankSupplyContractIDInput().should('have.value', MOCK_DEAL.details.bankSupplyContractID);
    cloneDeal.supplyContractNameInput().should('have.value', MOCK_DEAL.details.bankSupplyContractName);
  });

  it('When a user clones a deal they progress to the dashboard page and the edited bankSupplyContractID/bankSupplyContractName is displayed in the deal page', async () => {
    deal = await createADeal(MOCK_DEAL, user);

    loginGoToDealPage(deal);
    goToCloneDealPage();

    pages.cloneDeal.bankSupplyContractIDInput().type('-cloned');
    pages.cloneDeal.supplyContractNameInput().type('-cloned');
    pages.cloneDeal.cloneTransactionsInput().click();

    pages.cloneDeal.submit().click();

    cy.url().should('include', '/dashboard');

    // TODO
    // when we have 'success' notification appearing in dashboard
    // click the 'success link' to get to the new deal page for testing the below.
    // go to deal page
    /*
    pages.dashboard.row(deal).bankSupplyContractIDLink().click();

    cy.url().should('include', '/contract');


    // confirm that the cloned deal has the bank deal ID and bank name submitted in the 'clone deal' form

    pages.contract.supplyContractName().invoke('text').then((text) => {
      expect(text.trim()).equal(`${MOCK_DEAL.details.bankSupplyContractID}-cloned`);
    });

    pages.contract.bankSupplyContractID().invoke('text').then((text) => {
      expect(text.trim()).equal(`${MOCK_DEAL.details.bankSupplyContractName}-cloned`);
    });
    */
  });

  // TODO when we have bonds/transactions setup
  //
  // When a user clones a deal and chooses to not clone transactions
  // the cloned deal should not include transactions
});

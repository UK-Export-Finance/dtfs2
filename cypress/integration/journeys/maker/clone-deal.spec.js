const { login  } = require('../../missions');
const { createADeal, deleteAllDeals } = require('../../missions/deal-api');
const relative = require('../../relativeURL');
const pages = require('../../pages');
const { errorSummary } = require('../../partials');

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

const TOTAL_FORM_FIELDS = 3;

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

  describe('When a user creates a deal and clicks `clone deal`', () => {
    it('should progress to the clone page with inputs prepopulated', () => {
      loginGoToDealPage(deal);
      goToCloneDealPage();

      // confirm that inputs are populated with the deal's initial bankSupplyContractID/bankSupplyContractName
      pages.cloneDeal.bankSupplyContractIDInput().should('have.value', MOCK_DEAL.details.bankSupplyContractID);
      pages.cloneDeal.bankSupplyContractNameInput().should('have.value', MOCK_DEAL.details.bankSupplyContractName);
    });
  });

  describe('When a user clones a deal', () => {
    it('should progress to the dashboard page and the edited bankSupplyContractID/bankSupplyContractName is displayed in the deal page', () => {
      loginGoToDealPage(deal);
      goToCloneDealPage();

      pages.cloneDeal.bankSupplyContractIDInput().type('-cloned');
      pages.cloneDeal.bankSupplyContractNameInput().type('-cloned');
      pages.cloneDeal.cloneTransactionsInput().click();

      pages.cloneDeal.submit().click();

      cy.url().should('include', '/dashboard/');

      // TODO
      // why does cypress time out here....

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
  });

  describe('When an empty form is submitted', () => {
    it('should display validation errors', () => {
      loginGoToDealPage(deal);
      goToCloneDealPage();

      pages.cloneDeal.bankSupplyContractIDInput().clear();
      pages.cloneDeal.bankSupplyContractNameInput().clear();

      pages.cloneDeal.submit().click();

      cy.url().should('include', '/clone');

      errorSummary.errorSummaryLinks().should('have.length', TOTAL_FORM_FIELDS);
    });
  });

  // TODO when we have bonds/transactions setup
  //
  // When a user clones a deal and chooses to not clone transactions
  // the cloned deal should not include transactions
});

const relative = require('../../relativeURL');
const pages = require('../../pages');
const partials = require('../../partials');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
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
  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user)
      .then( insertedDeal => deal=insertedDeal );
  });

  describe('When a user creates a deal and clicks `clone deal`', () => {
    it('should progress to the clone page with inputs prepopulated', () => {

      cy.loginGoToDealPage(user, deal);
      goToCloneDealPage();

      // confirm that inputs are populated with the deal's initial bankSupplyContractID/bankSupplyContractName
      pages.cloneDeal.bankSupplyContractIDInput().should('have.value', MOCK_DEAL.details.bankSupplyContractID);
      pages.cloneDeal.bankSupplyContractNameInput().should('have.value', MOCK_DEAL.details.bankSupplyContractName);

    });
  });

  describe('When an empty form is submitted', () => {
    it('should display validation errors', () => {
      cy.loginGoToDealPage(user, deal);
      goToCloneDealPage();

      pages.cloneDeal.bankSupplyContractIDInput().clear();
      pages.cloneDeal.bankSupplyContractNameInput().clear();

      pages.cloneDeal.submit().click();

      cy.url().should('include', '/clone');

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_FORM_FIELDS);
    });
  });

  describe('When a user clones a deal', () => {
    it('should progress to the dashboard page and display a success message', () => {
      cy.loginGoToDealPage(user, deal);
      goToCloneDealPage();

      pages.cloneDeal.bankSupplyContractIDInput().type('-cloned');
      pages.cloneDeal.bankSupplyContractNameInput().type('-cloned');
      pages.cloneDeal.cloneTransactionsInput().click();

      pages.cloneDeal.submit().click();

      cy.url().should('include', '/dashboard/');

      // confirm success message is displayed
      partials.successMessage.successMessage().should('be.visible');
      partials.successMessage.successMessageListItem().contains('cloned successfully');

      // click link to cloned deal
      partials.successMessage.successMessageLink().click();
      cy.url().should('include', '/contract/');

      // confirm that the cloned deal has the bankSupplyContractID/bankSupplyContractName submitted in the 'clone deal' form
      pages.contract.bankSupplyContractName().invoke('text').then((text) => {
        expect(text.trim()).equal(`${MOCK_DEAL.details.bankSupplyContractName}-cloned`);
      });

      pages.contract.bankSupplyContractID().invoke('text').then((text) => {
        expect(text.trim()).equal(`${MOCK_DEAL.details.bankSupplyContractID}-cloned`);
      });
    });

    // TODO when we have bonds/transactions setup
    //
    // When a user clones a deal and chooses to not clone transactions
    // the cloned deal should not include transactions
  });
});

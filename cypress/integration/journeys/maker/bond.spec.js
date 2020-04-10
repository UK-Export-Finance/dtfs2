const { createADeal } = require('../../missions');
const { deleteAllDeals } = require('../../missions/deal-api');

const pages = require('../../pages');
const missions = require('../../missions');
// const relative = require('../../relativeURL');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    // TODO rename to bankSupplyContractID and bankSupplyContractName
    bankDealId: 'someDealId',
    bankDealName: 'someDealName',
  },
};

context('Add a bond', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    deal = createADeal({
      ...MOCK_DEAL.details,
      ...user,
    });
  });

  describe('When a user clicks `Add a Bond` from the deal page', () => {
    it('should progress to the bond details page', () => {
      cy.url().should('include', '/contract');

      pages.contract.addBondButton().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/details');
    });
  });

});

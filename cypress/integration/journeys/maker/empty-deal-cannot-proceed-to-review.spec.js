const { contract } = require('../../pages');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('A maker creates a new deal without filling in required forms', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('should have a disabled `proceed to review` button and display a message', () => {
    cy.createADeal({
      username: user.username,
      password: user.password,
      bankDealId: MOCK_DEAL.details.bankSupplyContractID,
      bankDealName: MOCK_DEAL.details.bankSupplyContractName,
    });

    cy.url().should('include', '/contract/');
    contract.pleaseCompleteAllForms().should('exist');
    contract.proceedToReview().should('be.disabled');
  });
});

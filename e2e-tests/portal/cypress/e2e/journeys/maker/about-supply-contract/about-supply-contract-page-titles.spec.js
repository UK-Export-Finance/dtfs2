const {
  contractAboutBuyer, contractAboutFinancial, contractAboutSupplier,
} = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');

const { BANK1_MAKER1 } = MOCK_USERS;

context('About supply contract page titles', () => {
  let deal;

  before(() => {
    cy.insertOneDeal(aDealWithAboutBuyerComplete, BANK1_MAKER1)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('displays correct page title for buyer', () => {
    cy.login(BANK1_MAKER1);

    contractAboutBuyer.visit(deal);
    contractAboutBuyer.title().contains('Add buyer details');
  });

  it('displays correct page title for financial information', () => {
    cy.login(BANK1_MAKER1);

    contractAboutFinancial.visit(deal);
    contractAboutFinancial.title().contains('Add financial information');
  });

  it('displays correct page title for Supplier and counter-indemnifier/guarantor', () => {
    cy.login(BANK1_MAKER1);

    contractAboutSupplier.visit(deal);
    contractAboutSupplier.title().contains('About the Supply Contract');
  });
});

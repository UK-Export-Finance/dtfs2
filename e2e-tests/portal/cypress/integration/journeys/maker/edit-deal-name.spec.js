const { contract, editDealName, defaults } = require('../../pages');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../fixtures/users');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('Edit deal name', () => {
  let deal;

  const dummyDeal = {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Tibettan submarine acquisition scheme',
  };

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(dummyDeal, BANK1_MAKER1)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('rejects an empty field', () => {
    cy.login(BANK1_MAKER1);
    contract.visit(deal);
    contract.editDealName().click();

    cy.title().should('eq', `Change name - ${deal.additionalRefName}${defaults.pageTitleAppend}`);
    editDealName.additionalRefName().should('have.value', deal.additionalRefName);
    editDealName.additionalRefName().type('{selectall}{backspace}');
    editDealName.submit().click();

    cy.url().should('eq', relative(`/contract/${deal._id}/edit-name`));

    editDealName.expectError('A value is required.');
  });

  it('updates deal.additionalRefName', () => {
    cy.login(BANK1_MAKER1);
    contract.visit(deal);
    contract.editDealName().click();


    editDealName.additionalRefName().type('{selectall}{backspace}asdfasfasf');
    editDealName.submit().click();

    contract.additionalRefName().invoke('text').then((text) => {
      expect(text.trim()).equal('asdfasfasf');
    });
  });
});

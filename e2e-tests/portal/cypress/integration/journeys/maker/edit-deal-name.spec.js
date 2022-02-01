const { contract, editDealName, defaults } = require('../../pages');
const relative = require('../../relativeURL');
const mockUsers = require('../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

context('Edit deal name', () => {
  let deal;

  const dummyDeal = {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Tibettan submarine acquisition scheme',
  };

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(dummyDeal, MAKER_LOGIN)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('rejects an empty field', () => {
    cy.login(MAKER_LOGIN);
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
    cy.login(MAKER_LOGIN);
    contract.visit(deal);
    contract.editDealName().click();

    editDealName.additionalRefName().type('{selectall}{backspace}asdfasfasf');
    editDealName.submit().click();

    contract.additionalRefName().invoke('text').then((text) => {
      expect(text.trim()).equal('asdfasfasf');
    });
  });
});

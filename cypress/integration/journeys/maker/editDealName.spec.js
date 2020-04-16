const {contract, editDealName} = require('../../pages');
const relative = require('../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

context('Edit deal name', () => {

  let deal = {
    details: {
      bankSupplyContractID: 'abc/1/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme'
    }
  };

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(user);
    cy.insertOneDeal(deal, user);
  });

  it('rejects an empty field', () => {
    cy.login(user);

    cy.allDeals().then( (deals) => {
      const deal = deals[0];

      contract.visit(deal);
      contract.editDealName().click();

      editDealName.bankSupplyContractName().type('{selectall}{backspace}');
      editDealName.submit().click();

      cy.url().should('eq', relative(`/contract/${deal._id}/edit-name`));

      editDealName.expectError('A value is required.');
    });
  });

  it('updates deal.details.bankSupplyContractName', () => {
    cy.login(user);

    cy.allDeals().then( (deals) => {
      const deal = deals[0];

      contract.visit(deal);
      contract.editDealName().click();


      editDealName.bankSupplyContractName().type('{selectall}{backspace}asdfasfasf');
      editDealName.submit().click();

      contract.bankSupplyContractName().invoke('text').then((text) => {
        expect(text.trim()).equal('asdfasfasf')
      });
    });
  });

});

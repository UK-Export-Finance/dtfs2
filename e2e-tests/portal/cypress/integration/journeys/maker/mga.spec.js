const {
  mga,
  footer,
} = require('../../pages');

const mockUsers = require('../../../fixtures/mockUsers');
// slight oddity- this test seems to need a straight 'maker'; so filtering slightly more than in other tests..
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.roles.length === 1 && user.username === 'BANK1_MAKER1'));

context('MGA', () => {
  describe('MGA docs page', () => {
    it('footer link should go to MGA page and list documents', () => {
      cy.login(MAKER_LOGIN);

      footer.mgaPageLink().click();
      cy.url().should('include', '/mga');

      mga.mgaLink().should('have.length', 2);
    });
  });
});

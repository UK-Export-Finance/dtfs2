const {
  mga,
  footer,
} = require('../../pages');
const MOCK_USERS = require('../../../fixtures/users');

const { BANK1_MAKER1 } = MOCK_USERS;

context('MGA', () => {
  describe('MGA docs page', () => {
    it('footer link should go to MGA page and list documents', () => {
      cy.login(BANK1_MAKER1);

      footer.mgaPageLink().click();
      cy.url().should('include', '/mga');

      mga.mgaLink().should('have.length', 2);
    });
  });
});

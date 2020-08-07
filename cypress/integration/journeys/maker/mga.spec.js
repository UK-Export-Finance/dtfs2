const {
  mga,
  footer,
} = require('../../pages');

const mockUsers = require('../../../fixtures/mockUsers');
// slight oddity- this test seems to need a straight 'maker'; so filtering slightly more than in other tests..
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.roles.length === 1) );

context('MGA', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.login(MAKER_LOGIN);
  });

  describe('MGA docs page', () => {
    it('footer link should go to MGA page and list documents', () => {
      footer.mgaPageLink().click();
      cy.url().should('include', '/mga');

      mga.mgaLink().should('have.length', 2);
    });
  });
});

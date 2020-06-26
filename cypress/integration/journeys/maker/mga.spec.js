const {
  mga,
  footer,
} = require('../../pages');

const maker = { username: 'MAKER', password: 'MAKER' };
context('MGA', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.login({ ...maker });
  });

  describe('MGA docs page', () => {
    it('footer link should go to MGA page and list documents', () => {
      footer.mgaPageLink().click();
      cy.url().should('include', '/mga');

      mga.mgaLink().should('have.length', 2);
    });
  });
});

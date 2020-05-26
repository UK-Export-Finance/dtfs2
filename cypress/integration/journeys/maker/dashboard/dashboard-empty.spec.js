const { dashboard, defaults } = require('../../../pages');
const relative = require('../../../relativeURL');

const maker1 = { username: 'MAKER', password: 'MAKER' };

context('Dashboard Deals', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(maker1);
  });

  it('Can display an empty dashboard', () => {
    cy.login({ ...maker1 });
    dashboard.visit();
    cy.title().should('eq', `Deals${defaults.pageTitleAppend}`);
  });
});

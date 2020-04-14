const {startNow} = require('../../pages');
const relative = require('../../relativeURL');

context('When a checker views the /start-now page', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('They should have 1 link that takes them to /dashboard, and a "View Dashboard" link that also takes them to /dashboard', () => {
    cy.login({username:'CHECKER', password:'CHECKER'});

    startNow.dashboardLink1().click();
    cy.url().should('eq', relative('/dashboard/0'));

    startNow.visit();
    startNow.viewDashboard().click();
    cy.url().should('eq', relative('/dashboard/0'));

  });

})

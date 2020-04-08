const {login} = require('../../missions');
const {startNow} = require('../../pages');
const relative = require('../../relativeURL');

context('When a maker views the /start-now page', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('They should have 2 links that take them to the dashboard, and a "Create New Submission" link that takes them to /before-you-start', () => {
    login({username:'MAKER', password:'MAKER'});

    startNow.dashboardLink1().click();
    cy.url().should('eq', relative('/dashboard/0'));

    startNow.visit();
    startNow.dashboardLink2().click();
    cy.url().should('eq', relative('/dashboard/0'));

    startNow.visit();
    startNow.createNewSubmission().click();
    cy.url().should('eq', relative('/before-you-start'));
  });

})

const relative = require('../../relativeURL');
const {
  dashboard,
} = require('../../pages');

context('Protected route', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('When a user that is not logged in navigates to a protected route, they progress to the login page', () => {
    // try to go to dashboard
    dashboard.visit();
    // confirm that we're taken back to / (login page)
    cy.url().should('eq', relative('/'));
  });

})

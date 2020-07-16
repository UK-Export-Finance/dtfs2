const {
  header,
  startNow,
  beforeYouStart,
  bankDetails,
  dashboard,
} = require('../../pages');
const relative = require('../../relativeURL');

context('Login', () => {
  beforeEach(() => {
    // [ dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('When a user that is not logged in navigates to a protected route, they progress to the login page', () => {
    startNow.visit();
    cy.url().should('eq', relative('/'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/'));

    bankDetails.visit();
    cy.url().should('eq', relative('/'));

    dashboard.visit();
    cy.url().should('eq', relative('/'));
  });

  it('A failed login leaves the user on the landing page', () => {
    cy.title().should('eq', 'Log in - UK Export Finance');

    cy.login({ username: 'shaker', password: 'MAKER' });

    cy.url().should('eq', relative('/'));
  });

  it('A successful login takes the user to the /start-now page', () => {
    cy.login({ username: 'MAKER', password: 'MAKER' });

    cy.url().should('eq', relative('/start-now'));
  });

  it('When a logged-in user clicks the home link they go to the /start-now page', () => {
    cy.login({ username: 'MAKER', password: 'MAKER' });

    header.home().click();

    cy.url().should('eq', relative('/start-now'));
  });

  it('When a logged-in user clicks the dashboard link they go to the /dashboard page', () => {
    cy.login({ username: 'MAKER', password: 'MAKER' });

    header.dashboard().click();

    cy.url().should('eq', relative('/dashboard/0'));
  });

  it('When a logged-in user clicks the service name link they go to the /start-now page', () => {
    cy.login({ username: 'MAKER', password: 'MAKER' });

    header.serviceName().click();

    cy.url().should('eq', relative('/start-now'));
  });

  it("Should pass Lighthouse audit", function () {
    cy.lighthouse({
      performance: 85,
      accessibility: 100,
      "best-practices": 85,
      seo: 85,
      pwa: 100,
    });
    cy.pa11y();
  });
  
});

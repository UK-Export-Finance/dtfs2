const {login} = require('../../missions');
const {header, startNow, beforeYouStart} = require('../../pages');
const appUnderTest = require('../../appUnderTest');
const relative = require('../../relativeURL');

context('Login', () => {
  beforeEach(() => {
    //[ dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
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

  });

  it('A failed login leaves the user on the landing page', () => {
    login({username: 'shaker', password: 'MAKER'});

    cy.url().should('eq', relative('/'));
  });

  it('A successful login takes the user to the /start-now page', () => {
    login({username: 'MAKER', password: 'MAKER'});

    cy.url().should('eq', relative('/start-now'));
  });

  it('When a logged-in user clicks the home link they go to the /start-now page', () => {
    login({username: 'MAKER', password: 'MAKER'});

    header.home().click();

    cy.url().should('eq', relative('/start-now'));
  });

})

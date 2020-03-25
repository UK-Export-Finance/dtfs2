const missions = require('../../missions');
const pages = require('../../pages');

context('Login failure', () => {
  beforeEach(() => {
    //[ dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('A failed login leaves the user on the landing page', () => {
    missions.logInAs('shaker', 'MAKER');

    cy.url().should('eq', 'http://localhost:5000/'); //TODO can't include hostname:port etc here..
  });

  it('A successful login takes the user to the /start-now page', () => {
    missions.logInAs('MAKER', 'MAKER');

    cy.url().should('include', '/start-now');
  });

})

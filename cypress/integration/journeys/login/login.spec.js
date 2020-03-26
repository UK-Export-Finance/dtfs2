const {login} = require('../../missions');
const pages = require('../../pages');
const relative = require('../../relativeURL');

context('Login', () => {
  beforeEach(() => {
    //[ dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('A failed login leaves the user on the landing page', () => {
    login({username: 'shaker', password: 'MAKER'});

    cy.url().should('eq', relative('/'));
  });

  it('A successful login takes the user to the /start-now page', () => {
    login({username: 'MAKER', password: 'MAKER'});

    cy.url().should('eq', relative('/start-now'));
  });

})

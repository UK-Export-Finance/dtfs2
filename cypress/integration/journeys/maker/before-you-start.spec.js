const {createNewSubmission} = require('../../missions');
const {beforeYouStart, unableToProceed} = require('../../pages');
const relative = require('../../relativeURL');

context('Red Line eligibility checking', () => {
  beforeEach(() => {
    //[ dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('A deal that fails red-line checks is rejected.', () => {
    createNewSubmission({username: 'MAKER', password: 'MAKER'});

    beforeYouStart.false().click();
    beforeYouStart.submit().click();

    cy.url().should('eq', relative('/unable-to-proceed'));

    unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/start-now'));
  });

  it('the Unable To Proceed page links back to the homepage.', () => {
    createNewSubmission({username: 'MAKER', password: 'MAKER'});

    beforeYouStart.false().click();
    beforeYouStart.submit().click();

    unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/start-now'));
  });

  it('A deal that passes red-line checks can progress to enter supply details.', () => {
    createNewSubmission({username: 'MAKER', password: 'MAKER'});

    beforeYouStart.true().click();
    beforeYouStart.submit().click();

    cy.url().should('include', '/before-you-start/bank-deal');
  });

})
